using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Data;
using Oracle.ManagedDataAccess.Client;
using WwwSqlDesigner.Data;

namespace WwwSqlDesigner.Controllers
{
    public class WwwSqlController : Controller
    {
        private readonly ILogger<WwwSqlController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public WwwSqlController(ILogger<WwwSqlController> logger, ApplicationDbContext context, IConfiguration configuration)
        {
            _logger = logger;
            _context = context;
            _configuration = configuration;
        }

        [HttpGet]
        [Route("backend/netcore-ef/list")]
        public async Task<IActionResult> List()
        {
            var list = await _context.DataModels
                .OrderBy(x => x.Keyword)
                .OrderByDescending(x => x.Version)
                .Select(x => x.Keyword + " v" + x.Version + " - /?keyword=" + x.Keyword + "&version=" + x.Version)
                .ToListAsync();
            return Content(string.Join("\n", list));
        }

        [HttpGet]
        [Route("backend/netcore-ef/load")]
        public async Task<IActionResult> Load(string? keyword, int? version)
        {
            if (string.IsNullOrEmpty(keyword))
            {
                return NotFound();
            }
            DataModel? model;
            if (!version.HasValue)
            {
                model = await _context.DataModels.OrderByDescending(x => x.CreatedAt).FirstOrDefaultAsync(x => x.Keyword == keyword);
            }
            else
            {
                model = await _context.DataModels.FirstOrDefaultAsync(x => x.Keyword == keyword && x.Version == version);
            }
            if (null == model)
            {
                _logger.LogWarning("Keyword not found: {keyword:0}", keyword);
                return NotFound();
            }
            return Content(model.Data, "text/xml");
        }

        [HttpPost]
        [Route("backend/netcore-ef/save")]
        public async Task<IActionResult> Save(string? keyword)
        {
            if (string.IsNullOrEmpty(keyword))
            {
                return NotFound();
            }
            //Read XML data from request body
            Request.EnableBuffering();
            Request.Body.Position = 0;
            string xmlData;
            using (var reader = new StreamReader(Request.Body, Encoding.UTF8))
            {
                xmlData = await reader.ReadToEndAsync().ConfigureAwait(false);
            }
            var save = _context.DataModels.OrderByDescending(x => x.CreatedAt).FirstOrDefault(x => x.Keyword == keyword);
            if (null == save)
            {
                var newModel = new DataModel()
                {
                    Keyword = keyword,
                    Data = xmlData,
                    CreatedAt = DateTime.Now,
                    Version = 0,
                };
                _context.DataModels.Add(newModel);
                _logger.LogInformation("New data model created: {keyword:0}", keyword);
            }
            else
            {
                var newModel = new DataModel()
                {
                    Keyword = keyword,
                    Data = xmlData,
                    CreatedAt = DateTime.Now,
                    Version = save.Version + 1,  //This does not need to be thread-safe as a unique (key/version) key exists in the DB.
                };
                _context.DataModels.Add(newModel);
                _logger.LogInformation("New Data model version: {keyword:0}", keyword);
            }
            _context.SaveChanges();
            return Content(string.Empty);
        }

        [HttpGet]
        [Route("backend/netcore-ef/import")]
        public IActionResult Import()
        {
            return NotFound();
        }

        [HttpPost]
        [Route("backend/audit/execute")]
        public async Task<IActionResult> ExecuteAudit([FromQuery] string objectType)
        {
            if (string.IsNullOrEmpty(objectType))
            {
                return BadRequest("Object type is required.");
            }

            var connectionString = _configuration.GetConnectionString("OracleConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                return StatusCode(500, "Oracle connection string is not configured.");
            }

            StringBuilder outputBuilder = new StringBuilder();

            try
            {
                using (OracleConnection connection = new OracleConnection(connectionString))
                {
                    await connection.OpenAsync();

                    // Enable DBMS_OUTPUT
                    using (OracleCommand cmdEnable = connection.CreateCommand())
                    {
                        cmdEnable.CommandText = "DBMS_OUTPUT.ENABLE(NULL);";
                        cmdEnable.CommandType = CommandType.Text;
                        await cmdEnable.ExecuteNonQueryAsync();
                    }

                    // Execute the package
                    using (OracleCommand cmdExecute = connection.CreateCommand())
                    {
                        cmdExecute.CommandText = "DA_API_SPY.PKG_DA_DESCRIBE_KW.prAddSingleDescriptSession";
                        cmdExecute.CommandType = CommandType.StoredProcedure;
                        
                        cmdExecute.Parameters.Add("pvDatabaseName", OracleDbType.Varchar2).Value = "DESA";
                        cmdExecute.Parameters.Add("pvSchemaName", OracleDbType.Varchar2).Value = "DA_API_SPY";
                        cmdExecute.Parameters.Add("pvObjectType", OracleDbType.Varchar2).Value = objectType.ToUpper();
                        cmdExecute.Parameters.Add("pvDebugYN", OracleDbType.Varchar2).Value = "N";

                        await cmdExecute.ExecuteNonQueryAsync();
                    }

                    // Fetch DBMS_OUTPUT
                    using (OracleCommand cmdGetLine = connection.CreateCommand())
                    {
                        cmdGetLine.CommandText = "DBMS_OUTPUT.GET_LINE(:line, :status)";
                        cmdGetLine.CommandType = CommandType.Text;

                        cmdGetLine.Parameters.Add("line", OracleDbType.Varchar2, 32767).Direction = ParameterDirection.Output;
                        cmdGetLine.Parameters.Add("status", OracleDbType.Int32).Direction = ParameterDirection.Output;

                        int status = 0;
                        while (status == 0)
                        {
                            await cmdGetLine.ExecuteNonQueryAsync();
                            var statusVal = cmdGetLine.Parameters["status"].Value;
                            status = (statusVal is OracleDecimal od) ? od.ToInt32() : Convert.ToInt32(statusVal);

                            if (status == 0)
                            {
                                var lineVal = cmdGetLine.Parameters["line"].Value;
                                string line = lineVal == null || lineVal is DBNull || (lineVal is OracleString os && os.IsNull) 
                                              ? string.Empty 
                                              : lineVal.ToString();
                                outputBuilder.AppendLine(line);
                            }
                        }
                    }
                }

                string finalOutput = outputBuilder.ToString();
                if (string.IsNullOrWhiteSpace(finalOutput))
                {
                    finalOutput = "Audit executed successfully, but no output was returned.";
                }

                return Content(finalOutput, "text/plain");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing audit package.");
                return StatusCode(500, $"An error occurred: {ex.Message}\n{ex.StackTrace}");
            }
        }
    }
}