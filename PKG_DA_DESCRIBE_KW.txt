package body PKG_DA_DESCRIBE_KW is



   nMaxOutputSizeLimit            constant  number := 3000;



   vDBListDev                     varchar2(100) := 'DEVC,DEVH,DEVJ,DEVN,DEVO01,DEVREP,DEVP';

   vDBListSI                      varchar2(100) := 'SIC,SIH,SIJ';

   vDBListTest                    varchar2(100) := 'TSTC,TSTH,TSTJ,TSTN,TSTO01,TSTO02,TSTP,TSTREP';

   vDBListProd                    varchar2(100) := 'APPSDB,CORNET,HSAPPS,HSZ,IRIS,JUSTIN,PRDN,PRDO01,PRDO02,PRDO03,PRDO04,PRDP';

   vDBListTrain                   varchar2(100) := 'TRNA,TRNE,TRNJ';

   vDBListBI                      varchar2(100) := 'BIPRDU,BIPRDZ,CONA';



   vDateFmt                       varchar2(30) := 'YYYY-MM-DD HH24:MI:SS';

   nLineLength                    number := 88;

   vLineStartChar                 varchar2(1) := '.';



function  fvGetStrPadChars             (pvInputChar                    IN     varchar2,

                                        pnNumChars                     IN     number)

  return  varchar2

   is



   vRtnStr                        varchar2(200) := '';



begin



   for i in 1 .. pnNumChars loop

      vRtnStr := vRtnStr || pvInputChar;

   end loop;



   return vRtnStr;



exception

   when others then

      return 'ERROR!!!';



end;



procedure prOutputDebug                (pvDebugYN                      IN     varchar2,

                                        pvMessageYN                    IN     varchar2)

   is



begin



   if pvDebugYN = 'Y' then

      dbms_output.put_line('DEBUG: ' || pvMessageYN);

   end if;



end prOutputDebug;



function put_chars                     (pvChar                         IN     varchar2,

                                        pnNum                          IN     number)

  return varchar2 is

   vRtnStr                     varchar2(4000) := '';

begin

   for n in 1 .. pnNum loop

      vRtnStr := vRtnStr || pvChar;

   end loop;



   return vRtnStr;

end put_chars;



function put_sized_text                (pvText                         IN     varchar2,

                                        pnNum                          IN     number,

                                        pvPaddingChar                  IN     varchar2 DEFAULT ' ')

  return varchar2 is

   vRtnStr                     varchar2(4000) := '';

begin

   if length(pvText) >= pnNum then

      return substr(pvText, 1, pnNum);

   else

      return put_chars(pvPaddingChar, pnNum - length(pvText)) || pvText;

   end if;

end put_sized_text;





function fvDecodeNullable              (pvNullableYN                   IN     varchar2)

  return varchar2 is

begin

   if pvNullableYN = 'Y' then

      return null;

   else

      return 'NOT NULL';

   end if;

end fvDecodeNullable;



function fvFormatDataTypes             (pvColumnName                   IN     varchar2,

                                        pvDataType                     IN     varchar2,

                                        pnDataLength                   IN     number,

                                        pvNullableYN                   IN     varchar2,

                                        pnDataPrecision                IN     number,

                                        pnDataScale                    IN     number,

                                        pvDataDefault                  IN     varchar2)

  return varchar2 is



   vRtnStr                        varchar2(4000);

   vBrackets                      varchar2(100) := null;

   nMaxBracketsLength             number := 16;



begin



   if pvDataType in ('VARCHAR2', 'CHAR') then

      vBrackets := pvDataType || '(' || pnDataLength || ')';

      vBrackets := vBrackets || put_chars(' ', nMaxBracketsLength - length(vBrackets));

      vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || pvColumnName || 

                            put_chars(' ', 31 - length(pvColumnName)) || 

                            vBrackets ||

                            fvDecodeNullable(pvNullableYN);



   elsif pvDataType in ('DATE', 'BLOB', 'CLOB') then

      vBrackets := pvDataType;

      vBrackets := vBrackets || put_chars(' ', nMaxBracketsLength - length(vBrackets));

      vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || pvColumnName || 

                            put_chars(' ', 31 - length(pvColumnName)) || 

                            vBrackets ||

                            fvDecodeNullable(pvNullableYN);



   elsif pvDataType = 'NUMBER' then

      vBrackets := pvDataType || '(' || pnDataPrecision;

      if nvl(pnDataScale, 0) <> 0 then

         vBrackets := vBrackets || ', ' || pnDataScale || ')';

         vBrackets := vBrackets || put_chars(' ', nMaxBracketsLength - length(vBrackets)) ||

                            fvDecodeNullable(pvNullableYN);

      else

         vBrackets := vBrackets || ')';

         vBrackets := vBrackets || put_chars(' ', nMaxBracketsLength - length(vBrackets)) || 

                            fvDecodeNullable(pvNullableYN);

      end if;



      vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || pvColumnName || 

                            put_chars(' ', 31 - length(pvColumnName));

      vRtnStr := vRtnStr || vBrackets;



   end if;



   return vRtnStr;



end fvFormatDataTypes;



function fnObjectNameHash              (pvObjectName                   IN     varchar2)

  return number is



   vObjectName                   varchar2(128) := upper(ltrim(rtrim(pvObjectname)));

   nLetterCode                   number;

   nSum                          number := 0;

   nLetterStartCode              number := ascii('A') - 1;



begin



   for n in 1 .. length(vObjectName) loop

      nLetterCode := ascii(substr(vObjectName, n, 1)) - nLetterStartCode;

      nSum := nSum + nLetterCode;

   end loop;

   return nSum;



exception

   when others then

      return 0;



end fnObjectNameHash;



function fvFormatDataTypes2            (pvColumnName                   IN     varchar2,

                                        pvDataType                     IN     varchar2,

                                        pnDataLength                   IN     number,

                                        pvNullableYN                   IN     varchar2,

                                        pnDataPrecision                IN     number,

                                        pnDataScale                    IN     number)

  return varchar2 is



   vRtnStr                        varchar2(4000) := null;

   vBrackets                      varchar2(100)  := null;

   nMaxBracketsLength             number := 16;



begin



   if pvDataType in ('VARCHAR2', 'CHAR') then

      vBrackets := pvDataType || '(' || pnDataLength || ')';

      vBrackets := vBrackets || put_chars(' ', nMaxBracketsLength - length(vBrackets));

      vRtnStr := put_chars(' ', 6) || pvColumnName || 

                            put_chars(' ', 31 - length(pvColumnName)) || 

                            vBrackets ||

                            fvDecodeNullable(pvNullableYN);



   elsif pvDataType in ('DATE', 'BLOB', 'CLOB') then

      vBrackets := pvDataType;

      vBrackets := vBrackets || put_chars(' ', nMaxBracketsLength - length(vBrackets));

      vRtnStr := put_chars(' ', 6) || pvColumnName || 

                            put_chars(' ', 31 - length(pvColumnName)) || 

                            vBrackets ||

                            fvDecodeNullable(pvNullableYN);



   elsif pvDataType = 'NUMBER' then

      vBrackets := pvDataType || '(' || pnDataPrecision;

      if nvl(pnDataScale, 0) <> 0 then

         vBrackets := vBrackets || ', ' || pnDataScale || ')';

         vBrackets := vBrackets || put_chars(' ', nMaxBracketsLength - length(vBrackets)) ||

                            fvDecodeNullable(pvNullableYN);

      else

         vBrackets := vBrackets || ')';

         vBrackets := vBrackets || put_chars(' ', nMaxBracketsLength - length(vBrackets)) || 

                            fvDecodeNullable(pvNullableYN);

      end if;



      vRtnStr := put_chars(' ', 6) || pvColumnName || 

                            put_chars(' ', 31 - length(pvColumnName));

      vRtnStr := vRtnStr || vBrackets;



   end if;



   return vRtnStr;



end fvFormatDataTypes2;



function get_objects_list              (pvDatabaseName                 IN     varchar2,

                                        pvSchemaName                   IN     varchar2 DEFAULT NULL,

                                        pvObjectType                   IN     varchar2 DEFAULT NULL)

  return varchar2 is



   vDatabaseName                  varchar2(128) := upper(ltrim(rtrim(pvDatabaseName)));

   vSchemaName                    varchar2(128);

   vObjectType                    varchar2(128);



   vStatement                     varchar2(4000);

   vRtnStr                        varchar2(8000) := null;

   vLastObjectType                varchar2(128)  := 'zzz';

   vFirstRow                      varchar2(1)    := 'Y';



   excObjNotFound                 exception;



begin



   if pvSchemaName is null then

      vSchemaName := 'ALL';

   else

      vSchemaName := upper(ltrim(rtrim(pvSchemaName)));

   end if;



   if pvObjectType is null then

      vObjectType := 'ALL';

   else

      vObjectType := upper(ltrim(rtrim(pvObjectType)));

   end if;



   vStatement := 'select do.object_type, do.object_name, do.status, do.created, do.last_ddl_time ' ||

                 '  from dba_objects@' || vDatabaseName || ' do ' ||

                 ' where (instr(''' || vObjectType || ''', do.object_type) > 0 or ''' || vObjectType || ''' = ''ALL'')' ||

                 '   and (''' || vSchemaName || ''' = ''ALL'' or do.owner = ''' || vSchemaName || ''')' ||

                 '   and do.object_type in (''TABLE'', ''VIEW'', ''PACKAGE'', ''FUNCTION'', ''PROCEDURE'')' ||

                 ' order by decode(do.object_type, ''TABLE'', 1, ''VIEW'', 2, ''PACKAGE'', 3, ''PROCEDURE'', 4, ''FUNCTION'', 5, 6), do.object_name';



   vRtnStr := put_chars('=', nLineLength) || chr(10) ||

                 '= REPORT: OBJECTS OWNED BY ' || vSchemaName || '@' || vDatabaseName || 

                 put_chars(' ', nLineLength - 29 - length('= REPORT: OBJECTS OWNED BY ' || vSchemaName || '@' || vDatabaseName)) || 

                 'Run Date: ' || to_char(sysdate, 'YYYY-MM-DD HH24:MI:SS') || chr(10) ||

                 '= ' || chr(10);



   if vObjectType <> 'ALL' then

      vRtnStr := vRtnStr || '= Object Type(s): ' || vObjectType || chr(10);

   end if;



   vRtnStr := vRtnStr || put_chars('-', nLineLength) || chr(10);



   execute immediate vStatement

      bulk collect into object_list_tab;



   if nvl(object_list_tab.last, 0) = 0 then

      raise excObjNotFound;

   end if;



   for i in 1 .. nvl(object_list_tab.last, 0) LOOP



      if length(vRtnStr) > nMaxOutputSizeLimit - 300 then

         vRtnStr := vRtnStr || '- ERROR - Max size hit after ' || i || ' iterations at ' || length(vRtnStr) || ' characters.';

         exit;

      end if;



      if vLastObjectType <> object_list_tab(i).object_type then

         vRtnStr := vRtnStr || chr(10) || object_list_tab(i).object_type || 'S' || chr(10);

         vLastObjectType := object_list_tab(i).object_type;

      end if;



      if vLastObjectType in ('TABLE', 'VIEW') then

         vRtnStr := vRtnStr || put_chars(' ', 3) || object_list_tab(i).object_name ||

                               put_chars(' ', 31 - length(object_list_tab(i).object_name)) || 

                               object_list_tab(i).status ||  

                               put_chars(' ', 9 - length(object_list_tab(i).status)) ||

                               'Created: ' || to_char(object_list_tab(i).created, 'YYYY-MM-DD') || ', ' ||

                               'Last Updated: ' || to_char(object_list_tab(i).last_ddl_time, 'YYYY-MM-DD') ||

                               chr(10);

      elsif vLastObjectType in ('PACKAGE', 'FUNCTION', 'PROCEDURE') then

         vRtnStr := vRtnStr || put_chars(' ', 3) || object_list_tab(i).object_name ||

                               put_chars(' ', 31 - length(object_list_tab(i).object_name)) || 

                               object_list_tab(i).status || 

                               put_chars(' ', 9 - length(object_list_tab(i).status)) ||

                               'Created: ' || to_char(object_list_tab(i).created, 'YYYY-MM-DD') || ', ' ||

                               'Last Updated: ' || to_char(object_list_tab(i).last_ddl_time, 'YYYY-MM-DD') ||

                               chr(10);

      end if;



   end loop;



   vRtnStr := vRtnStr || chr(10) || put_chars('-', 88) || chr(10) ||

              '= END OF REPORT: OBJECTS OWNED BY ' || vSchemaName || '@' || vDatabaseName || chr(10) ||

              put_chars('=', 88);



   return vRtnStr;



exception

   when excObjNotFound then

      return put_chars('=', nLineLength) || chr(10) ||

                 '= REPORT: OBJECTS OWNED BY ' || vSchemaName || '@' || vDatabaseName || 

                 put_chars(' ', nLineLength - 29 - length('= REPORT: OBJECTS OWNED BY ' || vSchemaName || '@' || vDatabaseName)) || 

                 'Run Date: ' || to_char(sysdate, 'YYYY-MM-DD HH24:MI:SS') || chr(10) ||

                 '= ' || chr(10) ||

                 '= Object Type(s): ' || vObjectType || chr(10) ||

                 put_chars('-', nLineLength) || chr(10) ||

                 '   ERROR: No objects found for ' || vSchemaName || '@' || vDatabaseName || '.' || chr(10) || 

                 put_chars('-', 88) || chr(10) ||

                 '= END OF REPORT: OBJECTS OWNED BY ' || vSchemaName || '@' || vDatabaseName || chr(10) ||

                 put_chars('=', 88);



   when others then

      return 'ERROR: ' || sqlerrm;



end get_objects_list;



procedure get_objects_list2            (pvDatabaseName                 IN     varchar2,

                                        pvSchemaName                   IN     varchar2 DEFAULT NULL,

                                        pvObjectType                   IN     varchar2 DEFAULT NULL) IS



   vDatabaseName                  varchar2(128) := upper(ltrim(rtrim(pvDatabaseName)));

   vSchemaName                    varchar2(128);

   vObjectType                    varchar2(128);



   vStatement                     varchar2(4000);

   vRtnStr                        varchar2(4000) := null;

   vLastObjectType                varchar2(128)  := 'zzz';

   vFirstRow                      varchar2(1)    := 'Y';



   excObjNotFound                 exception;



begin



   if pvSchemaName is null then

      vSchemaName := 'ALL';

   else

      vSchemaName := upper(ltrim(rtrim(pvSchemaName)));

   end if;



   if pvObjectType is null then

      vObjectType := 'ALL';

   else

      vObjectType := upper(ltrim(rtrim(pvObjectType)));

   end if;



   vStatement := 'select do.object_type, do.object_name, do.status, do.created, do.last_ddl_time ' ||

                 '  from dba_objects@' || vDatabaseName || ' do ' ||

                 ' where (instr(''' || vObjectType || ''', do.object_type) > 0 or ''' || vObjectType || ''' = ''ALL'')' ||

                 '   and (''' || vSchemaName || ''' = ''ALL'' or do.owner = ''' || vSchemaName || ''')' ||

                 '   and do.object_type in (''TABLE'', ''VIEW'', ''PACKAGE'', ''FUNCTION'', ''PROCEDURE'')' ||

                 '   and instr(do.object_name, ''$'') = 0' ||

                 ' order by decode(do.object_type, ''TABLE'', 1, ''VIEW'', 2, ''PACKAGE'', 3, ''PROCEDURE'', 4, ''FUNCTION'', 5, 6), do.object_name';



   dbms_output.put_line(put_chars('=', nLineLength));

   dbms_output.put_line('= REPORT: OBJECTS OWNED BY ' || vSchemaName || '@' || vDatabaseName

                           || put_chars(' ', nLineLength - 29 - length('= REPORT: OBJECTS OWNED BY ' || vSchemaName || '@' || vDatabaseName)) 

                           || 'Run Date: ' || to_char(sysdate, 'YYYY-MM-DD HH24:MI:SS'));

   dbms_output.put_line('= ');



   if vObjectType <> 'ALL' then

      dbms_output.put_line('= Object Type(s): ' || vObjectType);

   end if;



   dbms_output.put_line(put_chars('-', nLineLength));



   execute immediate vStatement

      bulk collect into object_list_tab;



   if nvl(object_list_tab.last, 0) = 0 then

      raise excObjNotFound;

   end if;



   for i in 1 .. nvl(object_list_tab.last, 0) LOOP

       vRtnStr := null;

      if vLastObjectType <> object_list_tab(i).object_type then

         vRtnStr := vRtnStr || chr(10) || object_list_tab(i).object_type || 'S' || chr(10);

         vLastObjectType := object_list_tab(i).object_type;

      end if;



      if vLastObjectType in ('TABLE', 'VIEW') then

         vRtnStr := vRtnStr || -- put_chars(' ', 3) || object_list_tab(i).object_name ||

                               vLineStartChar || ' ' || object_list_tab(i).object_name ||

                               put_chars(' ', 31 - length(object_list_tab(i).object_name)) || 

                               object_list_tab(i).status || 

                               put_chars(' ', 9 - length(object_list_tab(i).status)) ||

                               'Created: ' || to_char(object_list_tab(i).created, 'YYYY-MM-DD') || ', ' ||

                               'Last Updated: ' || to_char(object_list_tab(i).last_ddl_time, 'YYYY-MM-DD');

      elsif vLastObjectType in ('PACKAGE', 'FUNCTION', 'PROCEDURE') then

         vRtnStr := vRtnStr || -- put_chars(' ', 3) || object_list_tab(i).object_name ||

                               vLineStartChar || ' ' || object_list_tab(i).object_name ||

                               put_chars(' ', 31 - length(object_list_tab(i).object_name)) || 

                               object_list_tab(i).status || 

                               put_chars(' ', 9 - length(object_list_tab(i).status)) ||

                               'Created: ' || to_char(object_list_tab(i).created, 'YYYY-MM-DD') || ', ' ||

                               'Last Updated: ' || to_char(object_list_tab(i).last_ddl_time, 'YYYY-MM-DD');

      end if;

      dbms_output.put_line(vRtnStr);



   end loop;



   dbms_output.put_line(chr(10) || put_chars('-', 88));

   dbms_output.put_line('= END OF REPORT: OBJECTS OWNED BY ' || vSchemaName || '@' || vDatabaseName);

   dbms_output.put_line(put_chars('=', 88));



exception

   when excObjNotFound then

      dbms_output.put_line(put_chars('=', nLineLength));

      dbms_output.put_line('= REPORT: OBJECTS OWNED BY ' || vSchemaName || '@' || vDatabaseName || 

                 put_chars(' ', nLineLength - 29 - length('= REPORT: OBJECTS OWNED BY ' || vSchemaName || '@' || vDatabaseName)) || 

                 'Run Date: ' || to_char(sysdate, 'YYYY-MM-DD HH24:MI:SS'));

      dbms_output.put_line('= ');

      dbms_output.put_line('= Object Type(s): ' || vObjectType);

      dbms_output.put_line(put_chars('-', nLineLength));

      dbms_output.put_line('   ERROR: No objects found for ' || vSchemaName || '@' || vDatabaseName || '.');

      dbms_output.put_line(put_chars('-', 88));

      dbms_output.put_line('= END OF REPORT: OBJECTS OWNED BY ' || vSchemaName || '@' || vDatabaseName);

      dbms_output.put_line(put_chars('=', 88));



   when others then

      dbms_output.put_line('ERROR: ' || sqlerrm);



end get_objects_list2;



function get_object_info               (pvDatabaseName                 IN     varchar2,

                                        pvSchemaName                   IN     varchar2,

                                        pvObjectName                   IN     varchar2)

  return varchar2 is



   vDatabaseName                  varchar2(128)  := upper(ltrim(rtrim(pvDatabaseName)));

   vSchemaName                    varchar2(128)  := upper(ltrim(rtrim(pvSchemaName)));

   vObjectName                    varchar2(128)  := upper(ltrim(rtrim(pvObjectName)));



   vRtnStr                        varchar2(4000) := null;

   vCurrObjType                   varchar2(30)   := null;

   vLastObjName                   varchar2(250)  := 'xyz';

   vCurrObjIsFunctionYN           varchar2(1)    := 'X';

   vCurrParamIsFirstYN            varchar2(1)    := 'X';

   vStatusLine                    varchar2(200)  := null;

   dCreatedDt                     date;

   dLastUpdatedDt                 date;



   vStatement                     varchar2(4000) := null;



   excObjNotFound                 exception;



begin



   vStatement := 'select ao.object_type, ao.status, ao.created, ao.last_ddl_time ' ||

                 '  from dba_objects@' || vDatabaseName || ' ao ' ||

                 ' where ao.owner = ''' || vSchemaName || '''' ||

                 '   and ao.object_name = ''' || vObjectName || '''' ||

                 ' order by instr(ao.object_type, ''BODY'')';

-- dbms_output.put_line('a' || vStatement);



   execute immediate vStatement

      bulk collect into object_info_tab;



   if nvl(object_info_tab.last, 0) = 0 then

      raise excObjNotFound;

   end if;



   for i in 1 .. nvl(object_info_tab.last, 0) LOOP



      vCurrObjType := object_info_tab(i).object_type;

      if vRtnStr is null then

         vRtnStr := object_info_tab(i).object_type || ' ' || vSchemaName || '.' || vObjectName || '@' || vDatabaseName;

      end if;

      if object_info_tab(i).object_type in ('TABLE', 'VIEW') then

         vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 

                               'Created: ' || to_char(object_info_tab(i).created, vDateFmt) || 

                               ', Last Updated: ' || to_char(object_info_tab(i).last_ddl_time, vDateFmt);

         vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 'Status: ' || object_info_tab(i).status;

         vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 'Columns:';

      elsif object_info_tab(i).object_type in ('PACKAGE') then

         vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 

                               'Created: ' || to_char(object_info_tab(i).created, vDateFmt) || 

                               ', Last Updated: ' || to_char(object_info_tab(i).last_ddl_time, vDateFmt);

         vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 'Status: Specification is ' || object_info_tab(i).status;

      elsif object_info_tab(i).object_type = 'PACKAGE BODY' then

         vRtnStr := vRtnStr || ', Body is ' || object_info_tab(i).status;

         vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 'Components:';

      elsif object_info_tab(i).object_type in ('FUNCTION', 'PROCEDURE') then

         dCreatedDt := object_info_tab(i).created;

         dLastUpdatedDt := object_info_tab(i).last_ddl_time;

         vStatusLine := 'Status: ' || object_info_tab(i).status;

      end if;

   end loop;



   if vCurrObjType in ('TABLE', 'VIEW') then



      vStatement := 'select dtc.column_id, dtc.column_name, dtc.data_type, dtc.data_length, ' ||

                    '       dtc.data_precision, dtc.data_scale, dtc.nullable, dtc.data_default ' ||

                    '  from dba_tab_columns@' || vDatabaseName || ' dtc ' ||

                    ' where dtc.owner = ''' || vSchemaName || '''' ||

                    '   and dtc.table_name = ''' || vObjectName || '''' ||

                    ' order by dtc.column_id';



      execute immediate vStatement

         bulk collect into column_info_tab;



      for i in 1 .. nvl(column_info_tab.last, 0) LOOP

         vRtnStr := vRtnStr || fvFormatDataTypes(column_info_tab(i).column_name,

                                                 column_info_tab(i).data_type,

                                                 column_info_tab(i).data_length,

                                                 column_info_tab(i).nullable_yn,

                                                 column_info_tab(i).data_precision,

                                                 column_info_tab(i).data_scale,

                                                 column_info_tab(i).data_default);



      end loop;



   elsif vCurrObjType like 'PACKAGE%' then



      vStatement := 'select da.subprogram_id, da.object_name, da.position, da.argument_name, da.data_type, da.in_out ' ||

                    '  from dba_arguments@' || vDatabaseName || ' da ' ||

                    ' where da.owner = ''' || vSchemaName || '''' ||

                    '   and da.package_name = ''' || vObjectName || '''' ||

                    ' order by da.subprogram_id, da.position';



-- dbms_output.put_line('c' || vStatement);



      execute immediate vStatement

         bulk collect into param_info_tab;



      for i in 1 .. nvl(param_info_tab.last, 0) LOOP



         if vLastObjName <> param_info_tab(i).object_name then

            vCurrParamIsFirstYN := 'Y';

            vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6);

            if param_info_tab(i).in_out = 'OUT' then

               vCurrObjIsFunctionYN := 'Y';

            else

               vCurrObjIsFunctionYN := 'N';

            end if;

         else

            vCurrParamIsFirstYN := 'N';

         end if;



         if vCurrObjIsFunctionYN = 'Y' then

         -- FUNCTIONS

            if vCurrParamIsFirstYN = 'Y' then

               vRtnStr := vRtnStr || 'FUNCTION ' || param_info_tab(i).object_name || ', returns ' || param_info_tab(i).data_type || chr(10) ||

                                     put_chars(' ', 6) || 'Parameters:';

            elsif vCurrParamIsFirstYN = 'N' then

               if param_info_tab(i).in_out = 'IN' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN     ' ||

                                        param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'OUT' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || '   OUT ' ||

                                        param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'IN/OUT' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN OUT ' ||

                                        param_info_tab(i).data_type;

               end if;

            end if;



         elsif vCurrObjIsFunctionYN = 'N' then

         -- PROCEDURES

            if vCurrParamIsFirstYN = 'Y' then

               if param_info_tab(i).in_out = 'IN' then

                  vRtnStr := vRtnStr || 'PROCEDURE ' || param_info_tab(i).object_name || chr(10) || 

                                        put_chars(' ', 6) || 'Parameters:' || chr(10) ||

                                        put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN     ' ||

                                        param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'OUT' then

                  vRtnStr := vRtnStr || 'PROCEDURE ' || param_info_tab(i).object_name || chr(10) || 

                                        put_chars(' ', 6) || 'Parameters:' || chr(10) ||

                                        put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || '   OUT ' ||

                                        param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'IN/OUT' then

                  vRtnStr := vRtnStr || 'PROCEDURE ' || param_info_tab(i).object_name || chr(10) || 

                                        put_chars(' ', 6) || 'Parameters:' || chr(10) ||

                                        put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN OUT ' ||

                                        param_info_tab(i).data_type;

               end if;

            elsif vCurrParamIsFirstYN = 'N' then

               if param_info_tab(i).in_out = 'IN' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN     ' ||

                                        param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'OUT' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || '   OUT ' ||

                                        param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'IN/OUT' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN OUT ' ||

                                        param_info_tab(i).data_type;

               end if;

            end if;

         end if;

         vLastObjName := param_info_tab(i).object_name;

      end loop;



   elsif vCurrObjType in ('FUNCTION', 'PROCEDURE') then



      vStatement := 'select da.subprogram_id, da.object_name, da.position, da.argument_name, da.data_type, da.in_out ' ||

                    '  from dba_arguments@' || vDatabaseName || ' da ' ||

                    ' where da.owner = ''' || vSchemaName || '''' ||

                    '   and da.object_name = ''' || vObjectName || '''' ||

                    ' order by da.subprogram_id, da.position';

--dbms_output.put_line('d' || vStatement);



      execute immediate vStatement

         bulk collect into param_info_tab;



      for i in 1 .. nvl(param_info_tab.last, 0) LOOP



         if vLastObjName <> param_info_tab(i).object_name then

            vCurrParamIsFirstYN := 'Y';

            if param_info_tab(i).in_out = 'OUT' then

               vCurrObjIsFunctionYN := 'Y';

            else

               vCurrObjIsFunctionYN := 'N';

            end if;

         else

            vCurrParamIsFirstYN := 'N';

         end if;



         if vCurrObjIsFunctionYN = 'Y' then

         -- FUNCTIONS

            if param_info_tab(i).in_out = 'OUT' then

               vRtnStr := vRtnStr || ', returns ' || param_info_tab(i).data_type;

               vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 

                                     'Created: ' || to_char(dCreatedDt, vDateFmt) || 

                                     ', Last Updated: ' || to_char(dLastUpdatedDt, vDateFmt);



               vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 'Status: ' || vStatusLine;

               vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 'Parameters:';

            elsif param_info_tab(i).in_out = 'IN' then

               vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                     put_chars(' ', 31 - length(param_info_tab(i).argument_name)) ||  'IN     ' ||

                                     param_info_tab(i).data_type;

            elsif param_info_tab(i).in_out = 'IN/OUT' then

               vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                     put_chars(' ', 31 - length(param_info_tab(i).argument_name)) ||  'IN/OUT ' ||

                                     param_info_tab(i).data_type;

            end if;



         elsif vCurrObjIsFunctionYN = 'N' then

         -- PROCEDURES

            if vCurrParamIsFirstYN = 'Y' then

               vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 

                                     'Created: ' || to_char(dCreatedDt, vDateFmt) || 

                                     ', Last Updated: ' || to_char(dLastUpdatedDt, vDateFmt);

               vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 'Status: ' || vStatusLine;

               vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 'Parameters:';



               if param_info_tab(i).in_out = 'IN' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                     put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN     ' || param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'OUT' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                     put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || '   OUT ' || param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'IN/OUT' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                     put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN OUT ' || param_info_tab(i).data_type;

               end if;



            elsif vCurrParamIsFirstYN = 'N' then

               if param_info_tab(i).in_out = 'IN' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN     ' || param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'OUT' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || '   OUT ' || param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'IN/OUT' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN OUT ' || param_info_tab(i).data_type;

               end if;

            end if;

         end if;



         vLastObjName := param_info_tab(i).object_name;



      end loop;



      if vCurrObjIsFunctionYN = 'Y' and param_info_tab.last = 1 then

         vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || '(none)';

      end if;



   end if;



   return vRtnStr;



exception



   when excObjNotFound then

      return 'ERROR: Object ' || vSchemaName || '.' || vObjectName || ' was not found at ' || vDatabaseName || '.';



   when others then

      return 'ERROR: ' || sqlerrm;



end get_object_info;



function fvGetObjectInfo               (pvDatabaseName                 IN     varchar2,

                                        pvSchemaName                   IN     varchar2,

                                        pvObjectName                   IN     varchar2)

  return varchar2 is



   vDatabaseName                  varchar2(128)  := upper(ltrim(rtrim(pvDatabaseName)));

   vSchemaName                    varchar2(128)  := upper(ltrim(rtrim(pvSchemaName)));

   vObjectName                    varchar2(128)  := upper(ltrim(rtrim(pvObjectName)));



   vRtnStr                        varchar2(4000) := null;

   vCurrObjType                   varchar2(30)   := null;

   vLastObjName                   varchar2(250)  := 'xyz';

   vCurrObjIsFunctionYN           varchar2(1)    := 'X';

   vCurrParamIsFirstYN            varchar2(1)    := 'X';

   vStatusLine                    varchar2(200)  := null;

   dCreatedDt                     date;

   dLastUpdatedDt                 date;



   vStatement                     varchar2(4000) := null;



   excObjNotFound                 exception;



begin



   vStatement := 'select ao.object_type, ao.status, ao.created, ao.last_ddl_time ' ||

                 '  from dba_objects@' || vDatabaseName || ' ao ' ||

                 ' where ao.owner = ''' || vSchemaName || '''' ||

                 '   and ao.object_name = ''' || vObjectName || '''' ||

                 '   and instr(ao.object_name, ''$'') = 0 ' ||

                 ' order by instr(ao.object_type, ''BODY'')';

-- dbms_output.put_line('a' || vStatement);



   execute immediate vStatement

      bulk collect into object_info_tab;



   if nvl(object_info_tab.last, 0) = 0 then

      raise excObjNotFound;

   end if;



   for i in 1 .. nvl(object_info_tab.last, 0) LOOP



      vCurrObjType := object_info_tab(i).object_type;

      if vRtnStr is null then

         vRtnStr := object_info_tab(i).object_type || ' ' || vSchemaName || '.' || vObjectName || '@' || vDatabaseName;

      end if;

      if object_info_tab(i).object_type in ('TABLE', 'VIEW') then

         vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 

                               'Created: ' || to_char(object_info_tab(i).created, vDateFmt) || 

                               ', Last Updated: ' || to_char(object_info_tab(i).last_ddl_time, vDateFmt);

         vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 'Status: ' || object_info_tab(i).status;

         vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 'Columns:';

      elsif object_info_tab(i).object_type in ('PACKAGE') then

         vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 

                               'Created: ' || to_char(object_info_tab(i).created, vDateFmt) || 

                               ', Last Updated: ' || to_char(object_info_tab(i).last_ddl_time, vDateFmt);

         vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 'Status: Specification is ' || object_info_tab(i).status;

      elsif object_info_tab(i).object_type = 'PACKAGE BODY' then

         vRtnStr := vRtnStr || ', Body is ' || object_info_tab(i).status;

         vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 'Components:';

      elsif object_info_tab(i).object_type in ('FUNCTION', 'PROCEDURE') then

         dCreatedDt := object_info_tab(i).created;

         dLastUpdatedDt := object_info_tab(i).last_ddl_time;

         vStatusLine := 'Status: ' || object_info_tab(i).status;

      end if;

   end loop;



   if vCurrObjType like 'PACKAGE%' then



      vStatement := 'select da.subprogram_id, da.object_name, da.position, da.argument_name, da.data_type, da.in_out ' ||

                    '  from dba_arguments@' || vDatabaseName || ' da ' ||

                    ' where da.owner = ''' || vSchemaName || '''' ||

                    '   and da.package_name = ''' || vObjectName || '''' ||

                    ' order by da.subprogram_id, da.position';



      execute immediate vStatement

         bulk collect into param_info_tab;



      for i in 1 .. nvl(param_info_tab.last, 0) LOOP



         if vLastObjName <> param_info_tab(i).object_name then

            vCurrParamIsFirstYN := 'Y';

            vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6);

            if param_info_tab(i).in_out = 'OUT' then

               vCurrObjIsFunctionYN := 'Y';

            else

               vCurrObjIsFunctionYN := 'N';

            end if;

         else

            vCurrParamIsFirstYN := 'N';

         end if;



         if vCurrObjIsFunctionYN = 'Y' then

         -- FUNCTIONS

            if vCurrParamIsFirstYN = 'Y' then

               vRtnStr := vRtnStr || 'FUNCTION ' || param_info_tab(i).object_name || ', returns ' || param_info_tab(i).data_type || chr(10) ||

                                     put_chars(' ', 6) || 'Parameters:';

            elsif vCurrParamIsFirstYN = 'N' then

               if param_info_tab(i).in_out = 'IN' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN     ' ||

                                        param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'OUT' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || '   OUT ' ||

                                        param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'IN/OUT' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN OUT ' ||

                                        param_info_tab(i).data_type;

               end if;

            end if;



         elsif vCurrObjIsFunctionYN = 'N' then

         -- PROCEDURES

            if vCurrParamIsFirstYN = 'Y' then

               if param_info_tab(i).in_out = 'IN' then

                  vRtnStr := vRtnStr || 'PROCEDURE ' || param_info_tab(i).object_name || chr(10) || 

                                        put_chars(' ', 6) || 'Parameters:' || chr(10) ||

                                        put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN     ' ||

                                        param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'OUT' then

                  vRtnStr := vRtnStr || 'PROCEDURE ' || param_info_tab(i).object_name || chr(10) || 

                                        put_chars(' ', 6) || 'Parameters:' || chr(10) ||

                                        put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || '   OUT ' ||

                                        param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'IN/OUT' then

                  vRtnStr := vRtnStr || 'PROCEDURE ' || param_info_tab(i).object_name || chr(10) || 

                                        put_chars(' ', 6) || 'Parameters:' || chr(10) ||

                                        put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN OUT ' ||

                                        param_info_tab(i).data_type;

               end if;

            elsif vCurrParamIsFirstYN = 'N' then

               if param_info_tab(i).in_out = 'IN' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN     ' ||

                                        param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'OUT' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || '   OUT ' ||

                                        param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'IN/OUT' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 9) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN OUT ' ||

                                        param_info_tab(i).data_type;

               end if;

            end if;

         end if;

         vLastObjName := param_info_tab(i).object_name;

      end loop;



   elsif vCurrObjType in ('FUNCTION', 'PROCEDURE') then



      vStatement := 'select da.subprogram_id, da.object_name, da.position, da.argument_name, da.data_type, da.in_out ' ||

                    '  from dba_arguments@' || vDatabaseName || ' da ' ||

                    ' where da.owner = ''' || vSchemaName || '''' ||

                    '   and da.object_name = ''' || vObjectName || '''' ||

                    ' order by da.subprogram_id, da.position';



      execute immediate vStatement

         bulk collect into param_info_tab;



      for i in 1 .. nvl(param_info_tab.last, 0) LOOP



         if vLastObjName <> param_info_tab(i).object_name then

            vCurrParamIsFirstYN := 'Y';

            if param_info_tab(i).in_out = 'OUT' then

               vCurrObjIsFunctionYN := 'Y';

            else

               vCurrObjIsFunctionYN := 'N';

            end if;

         else

            vCurrParamIsFirstYN := 'N';

         end if;



         if vCurrObjIsFunctionYN = 'Y' then

         -- FUNCTIONS

            if param_info_tab(i).in_out = 'OUT' then

               vRtnStr := vRtnStr || ', returns ' || param_info_tab(i).data_type;

               vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 

                                     'Created: ' || to_char(dCreatedDt, vDateFmt) || 

                                     ', Last Updated: ' || to_char(dLastUpdatedDt, vDateFmt);



               vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 'Status: ' || vStatusLine;

               vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 'Parameters:';

            elsif param_info_tab(i).in_out = 'IN' then

               vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                     put_chars(' ', 31 - length(param_info_tab(i).argument_name)) ||  'IN     ' ||

                                     param_info_tab(i).data_type;

            elsif param_info_tab(i).in_out = 'IN/OUT' then

               vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                     put_chars(' ', 31 - length(param_info_tab(i).argument_name)) ||  'IN/OUT ' ||

                                     param_info_tab(i).data_type;

            end if;



         elsif vCurrObjIsFunctionYN = 'N' then

         -- PROCEDURES

            if vCurrParamIsFirstYN = 'Y' then

               vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 

                                     'Created: ' || to_char(dCreatedDt, vDateFmt) || 

                                     ', Last Updated: ' || to_char(dLastUpdatedDt, vDateFmt);

               vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 'Status: ' || vStatusLine;

               vRtnStr := vRtnStr || chr(10) || put_chars(' ', 3) || 'Parameters:';



               if param_info_tab(i).in_out = 'IN' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                     put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN     ' || param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'OUT' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                     put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || '   OUT ' || param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'IN/OUT' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                     put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN OUT ' || param_info_tab(i).data_type;

               end if;



            elsif vCurrParamIsFirstYN = 'N' then

               if param_info_tab(i).in_out = 'IN' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN     ' || param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'OUT' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || '   OUT ' || param_info_tab(i).data_type;

               elsif param_info_tab(i).in_out = 'IN/OUT' then

                  vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN OUT ' || param_info_tab(i).data_type;

               end if;

            end if;

         end if;



         vLastObjName := param_info_tab(i).object_name;



      end loop;



      if vCurrObjIsFunctionYN = 'Y' and param_info_tab.last = 1 then

         vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || '(none)';

      end if;



   end if;



exception



   when excObjNotFound then

      dbms_output.put_line('ERROR - Object not found.');



   when others then

      dbms_output.put_line('ERROR - ' || sqlerrm);



end fvGetObjectInfo;





procedure get_object_info2             (pvDatabaseName                 IN     varchar2,

                                        pvSchemaName                   IN     varchar2,

                                        pvObjectName                   IN     varchar2) is



   vDatabaseName                  varchar2(128)  := upper(ltrim(rtrim(pvDatabaseName)));

   vSchemaName                    varchar2(128)  := upper(ltrim(rtrim(pvSchemaName)));

   vObjectName                    varchar2(128)  := upper(ltrim(rtrim(pvObjectName)));



   vRtnStr                        varchar2(4000) := null;

   vLineStr                       varchar2(4000) := null;

   vCurrObjType                   varchar2(30)   := null;

   vLastObjName                   varchar2(250)  := 'xyz';

   vCurrObjIsFunctionYN           varchar2(1)    := 'X';

   vCurrParamIsFirstYN            varchar2(1)    := 'X';

   vSpecLine                      varchar2(200)  := null;

   vStatusLine                    varchar2(200)  := null;

   dCreatedDt                     date;

   dLastUpdatedDt                 date;

   bTextHasBeenOutput             boolean        := FALSE;



   vStatement                     varchar2(4000) := null;



   excObjNotFound                 exception;



begin



   vStatement := 'select ao.object_type, ao.status, ao.created, ao.last_ddl_time ' ||

                 '  from dba_objects@' || vDatabaseName || ' ao ' ||

                 ' where ao.owner = ''' || vSchemaName || '''' ||

                 '   and ao.object_name = ''' || vObjectName || '''' ||

                 ' order by instr(ao.object_type, ''BODY'')';



   execute immediate vStatement

      bulk collect into object_info_tab;



   if nvl(object_info_tab.last, 0) = 0 then

      raise excObjNotFound;

   end if;



   for i in 1 .. nvl(object_info_tab.last, 0) LOOP



      vCurrObjType := object_info_tab(i).object_type;

      if not bTextHasBeenOutput then

         vLineStr := object_info_tab(i).object_type || ' ' || vSchemaName || '.' || vObjectName || '@' || vDatabaseName;

         if object_info_tab(i).object_type <> 'FUNCTION' then

            dbms_output.put_line(vLineStr);

         end if;

         bTextHasBeenOutput := TRUE;

      end if;

      if object_info_tab(i).object_type in ('TABLE', 'VIEW') then

         dbms_output.put_line(vLineStartChar || '   ' || 'Created: ' || to_char(object_info_tab(i).created, vDateFmt) || 

                               ', Last Updated: ' || to_char(object_info_tab(i).last_ddl_time, vDateFmt));

         dbms_output.put_line(vLineStartChar || '   ' || 'Status: ' || object_info_tab(i).status);

         dbms_output.put_line(vLineStartChar || '   ' || 'Columns:');

         bTextHasBeenOutput := TRUE;

      elsif object_info_tab(i).object_type in ('PACKAGE') then

         dbms_output.put_line(vLineStartChar || '   Created: ' || to_char(object_info_tab(i).created, vDateFmt) || 

                               ', Last Updated: ' || to_char(object_info_tab(i).last_ddl_time, vDateFmt));

         vSpecLine := vLineStartChar || '   Status: Specification is ' || object_info_tab(i).status;

         bTextHasBeenOutput := TRUE;

      elsif object_info_tab(i).object_type = 'PACKAGE BODY' then

         dbms_output.put_line(vSpecLine || ', Body is ' || object_info_tab(i).status);

         dbms_output.put_line(vLineStartChar || '   Components:');

         bTextHasBeenOutput := TRUE;

      elsif object_info_tab(i).object_type in ('FUNCTION', 'PROCEDURE') then

         dCreatedDt := object_info_tab(i).created;

         dLastUpdatedDt := object_info_tab(i).last_ddl_time;

         vStatusLine := 'Status: ' || object_info_tab(i).status;

      end if;

   end loop;



   if vCurrObjType in ('TABLE', 'VIEW') then



      vStatement := 'select dtc.column_id, dtc.column_name, dtc.data_type, dtc.data_length, ' ||

                    '       dtc.data_precision, dtc.data_scale, dtc.nullable ' ||

                    '  from dba_tab_columns@' || vDatabaseName || ' dtc ' ||

                    ' where dtc.owner = ''' || vSchemaName || '''' ||

                    '   and dtc.table_name = ''' || vObjectName || '''' ||

                    ' order by dtc.column_id';



      execute immediate vStatement

         bulk collect into column_info_tab;



      for i in 1 .. nvl(column_info_tab.last, 0) LOOP

         dbms_output.put_line(vLineStartChar || fvFormatDataTypes2(column_info_tab(i).column_name,

                                                   column_info_tab(i).data_type,

                                                   column_info_tab(i).data_length,

                                                   column_info_tab(i).nullable_yn,

                                                   column_info_tab(i).data_precision,

                                                   column_info_tab(i).data_scale));



      end loop;



   elsif vCurrObjType like 'PACKAGE%' then



      vStatement := 'select da.subprogram_id, dp.procedure_name, da.position, da.argument_name, da.data_type, da.in_out ' ||

                    '  from dba_procedures@' || vDatabaseName || ' dp,' ||

                    '       dba_arguments@' || vDatabaseName || ' da ' ||

                    ' where dp.owner = ''' || vSchemaName || '''' ||

                    '   and dp.object_name = ''' || vObjectName || '''' ||

                    '   and dp.object_id = da.object_id(+) ' ||

                    '   and dp.subprogram_id = da.subprogram_id(+) ' ||

                    '   and dp.procedure_name is not null ' ||

                    ' order by dp.procedure_name, da.position';



-- dbms_output.put_line('c' || vStatement);



      execute immediate vStatement

         bulk collect into param_info_tab;



      for i in 1 .. nvl(param_info_tab.last, 0) LOOP

-- dbms_output.put_line('here 1');

         if vLastObjName <> param_info_tab(i).object_name then

-- dbms_output.put_line('here 2a');

            vCurrParamIsFirstYN := 'Y';

            vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6);

            if param_info_tab(i).in_out = 'OUT' then

-- dbms_output.put_line('here 2b');

               vCurrObjIsFunctionYN := 'Y';

            else

-- dbms_output.put_line('here 2c');

               vCurrObjIsFunctionYN := 'N';

            end if;

         else

-- dbms_output.put_line('here 2d');

            vCurrParamIsFirstYN := 'N';

         end if;



         if vCurrObjIsFunctionYN = 'Y' then

-- dbms_output.put_line('here 3');

         -- FUNCTIONS

            if vCurrParamIsFirstYN = 'Y' then

-- dbms_output.put_line('here 3a');

               dbms_output.put_line(vLineStartChar || put_chars(' ', 6) || 'FUNCTION ' || param_info_tab(i).object_name || ', returns ' || param_info_tab(i).data_type);

               dbms_output.put_line(vLineStartChar || put_chars(' ', 9) || 'Parameters:');

            elsif vCurrParamIsFirstYN = 'N' then

-- dbms_output.put_line('here 3b');

               if param_info_tab(i).in_out = 'IN' then

-- dbms_output.put_line('here 3c');

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 12) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN     ' ||

                                        param_info_tab(i).data_type);

               elsif param_info_tab(i).in_out = 'OUT' then

-- dbms_output.put_line('here 3d');

if param_info_tab(i).argument_name is not null then

-- dbms_output.put_line('DEBUG: name: ' || param_info_tab(i).argument_name);

-- dbms_output.put_line('DEBUG: length: ' || length(nvl(param_info_tab(i).argument_name, '')) || ', and ' || 31 - length(nvl(param_info_tab(i).argument_name, '')));

-- dbms_output.put_line('DEBUG: type: ' || param_info_tab(i).data_type);

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 12) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || '   OUT ' ||

                                        param_info_tab(i).data_type);

end if;

               elsif param_info_tab(i).in_out = 'IN/OUT' then

-- dbms_output.put_line('here 3e');

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 12) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN OUT ' ||

                                        param_info_tab(i).data_type);

               else

-- dbms_output.put_line('here 3f');

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 12) || '(none)');

               end if;

            end if;



         elsif vCurrObjIsFunctionYN = 'N' then

-- dbms_output.put_line('here 4');

         -- PROCEDURES

            if vCurrParamIsFirstYN = 'Y' then

-- dbms_output.put_line('here 4a');

               if param_info_tab(i).in_out = 'IN' then

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 6) || 'PROCEDURE ' || param_info_tab(i).object_name);

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 9) || 'Parameters:');

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 12) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN     ' ||

                                        param_info_tab(i).data_type);

               elsif param_info_tab(i).in_out = 'OUT' then

-- dbms_output.put_line('here 4b');

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 6) || 'PROCEDURE ' || param_info_tab(i).object_name);

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 9) || 'Parameters:');

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 12) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || '   OUT ' ||

                                        param_info_tab(i).data_type);

               elsif param_info_tab(i).in_out = 'IN/OUT' then

-- dbms_output.put_line('here 4c');

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 6) || 'PROCEDURE ' || param_info_tab(i).object_name);

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 9) || 'Parameters:');

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 12) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN OUT ' ||

                                        param_info_tab(i).data_type);

               else

-- dbms_output.put_line('here 4d');

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 6) || 'PROCEDURE ' || param_info_tab(i).object_name);

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 9) || 'Parameters: (none)');

               end if;

            elsif vCurrParamIsFirstYN = 'N' then

-- dbms_output.put_line('here 4e');

               if param_info_tab(i).in_out = 'IN' then

-- dbms_output.put_line('here 4f');

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 12) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN     ' ||

                                        param_info_tab(i).data_type);

               elsif param_info_tab(i).in_out = 'OUT' then

-- dbms_output.put_line('here 4g');

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 12) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || '   OUT ' ||

                                        param_info_tab(i).data_type);

               elsif param_info_tab(i).in_out = 'IN/OUT' then

-- dbms_output.put_line('here 4h');

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 12) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN OUT ' ||

                                        param_info_tab(i).data_type);

               end if;

            end if;

         end if;

         vLastObjName := param_info_tab(i).object_name;

      end loop;

-- dbms_output.put_line('here 999');



   elsif vCurrObjType in ('FUNCTION', 'PROCEDURE') then



      vStatement := 'select da.subprogram_id, da.object_name, da.position, da.argument_name, da.data_type, da.in_out ' ||

                    '  from dba_arguments@' || vDatabaseName || ' da ' ||

                    ' where da.owner = ''' || vSchemaName || '''' ||

                    '   and da.object_name = ''' || vObjectName || '''' ||

                    ' order by da.subprogram_id, da.position';

-- dbms_output.put_line('d' || vStatement);



      execute immediate vStatement

         bulk collect into param_info_tab;



      for i in 1 .. nvl(param_info_tab.last, 0) LOOP

         if vLastObjName <> param_info_tab(i).object_name then

            vCurrParamIsFirstYN := 'Y';

            if param_info_tab(i).in_out = 'OUT' then

               vCurrObjIsFunctionYN := 'Y';

            else

               vCurrObjIsFunctionYN := 'N';

            end if;

         else

            vCurrParamIsFirstYN := 'N';

         end if;



         if vCurrObjIsFunctionYN = 'Y' then

         -- FUNCTIONS

            if param_info_tab(i).in_out = 'OUT' then

               dbms_output.put_line(vLineStr || ', returns ' || param_info_tab(i).data_type);

               dbms_output.put_line(vLineStartChar || put_chars(' ', 3) || 

                                     'Created: ' || to_char(dCreatedDt, vDateFmt) || 

                                     ', Last Updated: ' || to_char(dLastUpdatedDt, vDateFmt));

               dbms_output.put_line(vLineStartChar || put_chars(' ', 3) || vStatusLine);

               dbms_output.put_line(vLineStartChar || put_chars(' ', 3) || 'Parameters:');

            elsif param_info_tab(i).in_out = 'IN' then

               dbms_output.put_line(vLineStartChar || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                     put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN     ' ||

                                     param_info_tab(i).data_type);

            elsif param_info_tab(i).in_out = 'IN/OUT' then

               dbms_output.put_line(vLineStartChar || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                     put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN/OUT ' ||

                                     param_info_tab(i).data_type);

            end if;



         elsif vCurrObjIsFunctionYN = 'N' then

         -- PROCEDURES

            if vCurrParamIsFirstYN = 'Y' then

               dbms_output.put_line(vLineStartChar || put_chars(' ', 3) || 

                                     'Created: ' || to_char(dCreatedDt, vDateFmt) || 

                                     ', Last Updated: ' || to_char(dLastUpdatedDt, vDateFmt));

               dbms_output.put_line(vLineStartChar || put_chars(' ', 3) || vStatusLine);

               dbms_output.put_line(vLineStartChar || put_chars(' ', 3) || 'Parameters:');



               if param_info_tab(i).in_out = 'IN' then

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                     put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN     ' || param_info_tab(i).data_type);

               elsif param_info_tab(i).in_out = 'OUT' then

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                     put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || '   OUT ' || param_info_tab(i).data_type);

               elsif param_info_tab(i).in_out = 'IN/OUT' then

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                     put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN OUT ' || param_info_tab(i).data_type);

               end if;



            elsif vCurrParamIsFirstYN = 'N' then

               if param_info_tab(i).in_out = 'IN' then

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN     ' || param_info_tab(i).data_type);

               elsif param_info_tab(i).in_out = 'OUT' then

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || '   OUT ' || param_info_tab(i).data_type);

               elsif param_info_tab(i).in_out = 'IN/OUT' then

                  dbms_output.put_line(vLineStartChar || put_chars(' ', 6) || param_info_tab(i).argument_name || 

                                        put_chars(' ', 31 - length(param_info_tab(i).argument_name)) || 'IN OUT ' || param_info_tab(i).data_type);

               end if;

            end if;

         end if;



         vLastObjName := param_info_tab(i).object_name;



      end loop;



      if vCurrObjIsFunctionYN = 'Y' and param_info_tab.last = 1 then

         vRtnStr := vRtnStr || chr(10) || put_chars(' ', 6) || '(none)';

      end if;



   end if;



--   dbms_output.put_line('RTNSTR: '); -- || vRtnStr);



exception



   when excObjNotFound then

      dbms_output.put_line('ERROR: Object ' || vSchemaName || '.' || vObjectName || ' was not found at ' || vDatabaseName || '.');



   when others then

      dbms_output.put_line('ERROR: ' || sqlerrm);



end get_object_info2;



/*

procedure get_class_objects            (pvDatabaseClass                IN     varchar2,

                                        pvObjectType                   IN     varchar2 DEFAULT NULL)

is



   vDBList                       varchar2(100);

   excBadClass                   exception;



begin



   if pvDatabaseClass = 'DEV' then 

      vDBList := vDBListDev; 

   elsif pvDatabaseClass = 'SI' then

      vDBList := vDBListSI;

   elsif pvDatabaseClass = 'TEST' then

      vDBList := vDBListTest;

   elsif pvDatabaseClass = 'PROD' then

      vDBList := vDBListProd;

   elsif pvDatabaseClass = 'TRAIN' then

      vDBList := vDBListTrain;

   elsif pvDatabaseClass = 'BI' then

      vDBList := vDBListBI;

   else

      raise excBadClass;

   end if;



   for x in (select db_link

               from user_db_links

              where instr(vDBList, db_link) > 0

              order by 1) loop



      dbms_output.put_line('===================================================================');

      dbms_output.put_line('Database Link: ' || x.db_link);

      dbms_output.put_line('-------------------------------');

      get_owner_object_counts2(x.db_link, null, pvObjectType);

      dbms_output.put_line('===================================================================');

      dbms_output.put_line('');

   end loop;



   rollback;



exception

   when excBadClass then

      dbms_output.put_line('ERROR: Class ' || pvDatabaseClass || ' is not in DEV, SI, TEST, PROD, TRAIN, or BI');

   when others then

      dbms_output.put_line('ERROR: ' || sqlerrm);



end get_class_objects;

*/



function ftGetModuleParamList           (pvDatabaseName                 IN     varchar2, 

                                         pvSchemaName                   IN     varchar2,

                                         pvPackageName                  IN     varchar2, 

                                         pvModuleName                   IN     varchar2)

  return param_info_return_tab_type 

         pipelined is



   vDatabaseName                  varchar2(128) := upper(ltrim(rtrim(pvDatabaseName)));

   vSchemaName                    varchar2(128) := upper(ltrim(rtrim(pvSchemaName)));

   vPackageName                   varchar2(128) := upper(ltrim(rtrim(pvPackageName)));

   vModuleName                    varchar2(128) := upper(ltrim(rtrim(pvModuleName)));



   nFoo                           number;

   vStatement                     varchar2(4000);



   excObjNotFound                 exception;



begin



   vStatement := 'select da.object_name, da.position, da.argument_name, da.data_type, da.in_out ' ||

                 '  from dba_arguments@' || vDatabaseName || ' da ' ||

                 ' where da.owner = ''' || vSchemaName || '''' ||

                 '   and (da.package_name = ''' || vPackageName || ''' or (''' || vPackageName || ''' is null and da.package_name is null))' ||

                 '   and da.object_name = ''' || vModuleName || '''' ||

                 ' order by da.subprogram_id, da.position';



--dbms_output.put_line(vStatement);



   execute immediate vStatement

      bulk collect into param_info_tab;



   for i in 1 .. nvl(param_info_tab.last, 0) LOOP



      if param_info_tab(i).position <> 0 then



      pipe row(param_info_rec(param_info_tab(i).object_name,

                              param_info_tab(i).position,

                              param_info_tab(i).argument_name,

                              param_info_tab(i).data_type,

                              param_info_tab(i).in_out));

      end if;



   end loop;



   return;



exception



   when excObjNotFound then

      pipe row (param_info_rec(null, null, 'ERROR - Object not found.', null, null));

      return;



   when others then

      pipe row (param_info_rec(null, null, 'ERROR - ' || sqlerrm, null, null));

      return;



end ftGetModuleParamList;





function ftGetPackageModuleList         (pvDatabaseName                 IN     varchar2, 

                                         pvSchemaName                   IN     varchar2, 

                                         pvPackageName                  IN     varchar2)

  return module_info_return_tab_type 

         pipelined is



   vDatabaseName                  varchar2(128)  := upper(ltrim(rtrim(pvDatabaseName)));

   vSchemaName                    varchar2(128)  := upper(ltrim(rtrim(pvSchemaName)));

   vPackageName                   varchar2(128)  := upper(ltrim(rtrim(pvPackageName)));



   nFoo                           number;

   vStatement                     varchar2(4000);

   vStatement2                    varchar2(4000);

   nNumFound                      number := 0;

   vProcOrFunc                    varchar2(20) := null;

   vReturnType                    varchar2(128) := null;



   excObjNotFound                 exception;



begin



   vStatement := 'select distinct dp.procedure_name, ''PROC_FUNC'', dp.subprogram_id, null ' ||

                 '  from dba_procedures@' || vDatabaseName || ' dp ' ||

                 ' where dp.owner = ''' || vSchemaName || '''' ||

                 '   and dp.object_name = ''' || vPackageName || '''' ||

                 '   and dp.subprogram_id <> 0 ' ||

                 '   and dp.object_type = ''PACKAGE''' ||

                 ' order by dp.subprogram_id';



-- dbms_output.put_line('d' || vStatement);



   execute immediate vStatement

      bulk collect into module_info_tab;



   for i in 1 .. nvl(module_info_tab.last, 0) LOOP



      vStatement2 := 'select max(data_type) ' ||

                        '  from dba_arguments@' || vDatabaseName || ' da ' ||

                        ' where da.owner = ''' || vSchemaName || '''' ||

                        '   and da.object_name = ''' || module_info_tab(i).module_name || '''' ||

                        '   and da.position = 0';



-- dbms_output.put_line(vStatement2);



      vReturnType := null;

      execute immediate vStatement2 into vReturnType; -- nNumFound;



      if vReturnType is not null then

         vProcOrFunc := 'FUNCTION';

         if vReturnType like '%BOOLEAN%' then

            vReturnType := 'BOOLEAN';

         end if;

      else

         vProcOrFunc := 'PROCEDURE';

      end if;



      pipe row(module_info_rec(module_info_tab(i).module_name,

                               vProcOrFunc,

                               module_info_tab(i).position,

                               vReturnType));



   end loop;



   return;



exception



   when excObjNotFound then

      pipe row (module_info_rec('ERROR - Object not found.', null, null));

      return;



   when others then

      pipe row (module_info_rec('ERROR - ' || sqlerrm, null, null));

      return;



end ftGetPackageModuleList;



function ftGetObjectGrantList          (pvDatabaseName                 IN     varchar2,

                                        pvSchemaName                   IN     varchar2,

                                        pvObjectName                   IN     varchar2)

  return grant_info_return_tab_type

         pipelined is



   vDatabaseName                  varchar2(128)  := upper(ltrim(rtrim(pvDatabaseName)));

   vSchemaName                    varchar2(128)  := upper(ltrim(rtrim(pvSchemaName)));

   vObjectName                    varchar2(128)  := upper(ltrim(rtrim(pvObjectName)));



   tGrantList                    grant_info_return_tab_type := grant_info_return_tab_type();

   vStatement                     varchar2(4000) := null;



   excObjGrantNotFound                 exception;



begin



   vStatement := 'select dtp.grantor, dtp.grantee, dtp.privilege, dtp.grantable, dtp.inherited' ||

                 '  from dba_tab_privs@' || vDatabaseName || ' dtp ' ||

                 ' where dtp.owner = ''' || vSchemaName || '''' ||

                 '   and dtp.table_name = ''' || vObjectName || '''' ||

                 ' order by dtp.grantor asc, dtp.grantee asc';



   execute immediate vStatement

      bulk collect into grant_info_tab;



   if nvl(grant_info_tab.last, 0) = 0 then

      raise excObjGrantNotFound;

   end if;



   for i in 1 .. nvl(grant_info_tab.last, 0) LOOP



       pipe row (grant_info_rec(grant_info_tab(i).grantor,

                                 grant_info_tab(i).grantee,

                                 grant_info_tab(i).privilege,

                                 grant_info_tab(i).grantable,

                                 grant_info_tab(i).inherited));

   end loop;



exception



   when excObjGrantNotFound then

      pipe row (grant_info_rec('No Grants Found.', null, null, null, null));

      dbms_output.put_line('No Grants Found for ' || vObjectName);

      return;



   when others then

      pipe row (grant_info_rec('ERROR - ' || sqlerrm, null, null, null, null));

      dbms_output.put_line('Other error for ' || vObjectName);

      return;





end ftGetObjectGrantList;





function ftGetTableColumnList          (pvDatabaseName                 IN     varchar2,

                                        pvSchemaName                   IN     varchar2,

                                        pvObjectName                   IN     varchar2)

  return column_info_return_tab_type

         pipelined is



   vDatabaseName                  varchar2(128)  := upper(ltrim(rtrim(pvDatabaseName)));

   vSchemaName                    varchar2(128)  := upper(ltrim(rtrim(pvSchemaName)));

   vObjectName                    varchar2(128)  := upper(ltrim(rtrim(pvObjectName)));



   tColumnList                    column_info_return_tab_type := column_info_return_tab_type();

   vStatement                     varchar2(4000) := null;



   excObjNotFound                 exception;



begin



   vStatement := 'select dtc.column_name, dtc.column_id, ' ||

                 '       dtc.data_type, dtc.data_length, ' ||

                 '       dtc.data_precision, dtc.data_scale, dtc.nullable, dtc.data_default ' ||

                 '  from dba_tab_columns@' || vDatabaseName || ' dtc ' ||

                 ' where dtc.owner = ''' || vSchemaName || '''' ||

                 '   and dtc.table_name = ''' || vObjectName || '''' ||

                 ' order by dtc.column_id';



--dbms_output.put_line('.......b' || vStatement);



   execute immediate vStatement

      bulk collect into column_info_tab;



   for i in 1 .. nvl(column_info_tab.last, 0) LOOP



       pipe row (column_info_rec(column_info_tab(i).column_name,

                                 column_info_tab(i).column_id,

                                 column_info_tab(i).data_type,

                                 column_info_tab(i).data_length,

                                 column_info_tab(i).data_precision,

                                 column_info_tab(i).data_scale,

                                 column_info_tab(i).nullable_yn,

                                 column_info_tab(i).data_default));

   end loop;



exception



   when excObjNotFound then

      pipe row (column_info_rec(null, 'ERROR - Object not found.', null, null, null, null, null));

      return;



   when others then

      pipe row (column_info_rec(null, 'ERROR - ' || sqlerrm, null, null, null, null, null));

      return;



end ftGetTableColumnList;





function ftGetObjectList               (pvDatabaseName                 IN     varchar2,

                                        pvSchemaName                   IN     varchar2 DEFAULT NULL,

                                        pvObjectType                   IN     varchar2 DEFAULT NULL)

  return object_list_return_tab_type 

         pipelined is



   vDatabaseName                  varchar2(128)   := upper(ltrim(rtrim(pvDatabaseName)));

   vSchemaName                    varchar2(128);

   vObjectType                    varchar2(128);



   vStatement                     varchar2(4000);

   vLastObjectType                varchar2(128)  := 'zzz';

   vFirstRow                      varchar2(1)    := 'Y';



   rObjectList                    object_list_rec;



   excObjNotFound                 exception;



begin



   if pvSchemaName is null then

      vSchemaName := 'ALL';

   else

      vSchemaName := upper(ltrim(rtrim(pvSchemaName)));

   end if;



   if pvObjectType is null then

      vObjectType := 'ALL';

   else

      vObjectType := upper(ltrim(rtrim(pvObjectType)));

   end if;



   vStatement := 'select do.object_type, do.object_name, do.status, do.created, do.last_ddl_time ' ||

                 '  from dba_objects@' || vDatabaseName || ' do ' ||

                 ' where (instr(''' || vObjectType || ''', do.object_type) > 0 or ''' || vObjectType || ''' = ''ALL'')' ||

                 '   and (''' || vSchemaName || ''' = ''ALL'' or do.owner = ''' || vSchemaName || ''')' ||

                 '   and do.object_type in (''TABLE'', ''VIEW'', ''PACKAGE'', ''FUNCTION'', ''PROCEDURE'', ''SEQUENCE'')' ||

                 '   and instr(do.object_name, ''$'') = 0 ' ||

                 ' order by decode(do.object_type, ''TABLE'', 1, ''VIEW'', 2, ''PACKAGE'', 3, ''PROCEDURE'', 4, ''FUNCTION'', 5, ''SEQUENCE'', 6), do.object_name';



   execute immediate vStatement

      bulk collect into object_list_tab;



   if nvl(object_list_tab.last, 0) = 0 then

      raise excObjNotFound;

   end if;



   for i in 1 .. nvl(object_list_tab.last, 0) LOOP

       pipe row (object_list_rec(object_list_tab(i).object_type,

                                 object_list_tab(i).object_name, 

                                 object_list_tab(i).status,

                                 object_list_tab(i).created,

                                 object_list_tab(i).last_ddl_time));

   end loop;



exception

   when excObjNotFound then

--      pipe row (object_list_rec('N/A', 'ERROR: Object not found.', null, null, null));

      return;

   when others then

      pipe row (object_list_rec('N/A', 'ERROR: ' || sqlerrm, null, null, null));

      return;



end ftGetObjectList;





procedure prAddDescriptionSessionData   (pvDatabaseName                 IN     varchar2,

                                         pvSchemaName                   IN     varchar2,

                                         pvObjectType                   IN     varchar2, 

                                         pvDebugYN                      IN     varchar2 := 'N')

       is



-- updates:

--   ALL records in da_description sessions for this combination of specific DB, schema, and object_type

-- creates:

--   1   da_description_session record

--   N   da_described_objects records

--   N*M da_described_table_columns records



   vDatabaseName                  varchar2(100) := upper(ltrim(rtrim(pvDatabaseName)));

   vSchemaName                    varchar2(100) := upper(ltrim(rtrim(pvSchemaName)));

   vObjectType                    varchar2(100) := upper(ltrim(rtrim(pvObjectType)));



   nObjectsAdded                  number    := 0;

   dDescribedDtm                  date      := sysdate;

   nItemsFound                    number;



   nDescriptionSessionId          number;

   nDescribedObjectId             number;

   nDescribedObjectGrantId        number;

   nDescribedTableColumnId        number;

   nDescribedModuleId             number;

   nDescribedModuleParamId        number;



   bSkipObject                    boolean;



   vErrorStr                      varchar2(200) := '';

   vErrorSep                      varchar2(2)   := '';



   excIncompleteParams            exception;



begin



   if vDatabaseName is null or vSchemaName is null or vObjectType is null then



      if vDatabaseName is null then

         vErrorStr := vErrorSep || 'DATABASE';

         vErrorSep := ', ';

      end if;

      if vSchemaName is null then

         vErrorStr := vErrorSep || 'SCHEMA';

         vErrorSep := ', ';

      end if;

      if vObjectType is null then

         vErrorStr := vErrorSep || 'OBJECT_TYPE';

         vErrorSep := ', ';

      end if;



      raise excIncompleteParams;

   end if;



   dbms_output.put_line('Extracting data for ' || vSchemaName || '@' || vDatabaseName || ', starting at ' 

                           || to_char(sysdate, 'HH24:MI:SS'));



   select dese_seq.nextval into nDescriptionSessionId from dual;



   update da_description_sessions

      set current_version_yn = 'N'

    where current_version_yn = 'Y'

      and database_nm = vDatabaseName

      and schema_nm = vSchemaName

      and object_type = vObjectType;



   insert into da_description_sessions

        ( DESCRIPTION_SESSION_ID        ,    --     NOT NULL  NUMBER(, )

          DATABASE_NM                   ,    --     NOT NULL  VARCHAR2(128)

          SCHEMA_NM                     ,    --     NOT NULL  VARCHAR2(128)

          OBJECT_TYPE                   ,    --     NOT NULL  VARCHAR2(128)

          SESSION_DTM                   ,    --  05 NOT NULL  DATE

          OBJECT_COUNT                  ,    --     NOT NULL  NUMBER(, )

          CURRENT_VERSION_YN                 --     NOT NULL  VARCHAR2(1)

        ) values (

          nDescriptionSessionId,

          vDatabaseName,

          vSchemaName,

          vObjectType,

          sysdate, --  05

          0,

          'Y'

        );



   commit;



   for obj in (select object_type, object_name, 

                      status, created, last_ddl_time

                 from table(ftGetObjectList(vDatabaseName, 

                                                            vSchemaName, 

                                                            vObjectType))

              ) loop



      bSkipObject := FALSE;



      for exc in (select exclusion_txt, prefix_yn, suffix_yn, middle_yn

                    from da_exclusion_texts

                   where object_type = vObjectType

                   order by 1

               ) loop



         if exc.prefix_yn = 'Y' then

            if obj.object_name like exc.exclusion_txt || '%' then

               bSkipObject := TRUE;

            end if;

         elsif exc.suffix_yn = 'Y' then

            if obj.object_name like '%' || exc.exclusion_txt then

               bSkipObject := TRUE;

            end if;

         elsif exc.middle_yn = 'Y' then

            if obj.object_name like '%' || exc.exclusion_txt || '%' then

               bSkipObject := TRUE;

            end if;

         end if;

      end loop;



      if bSkipObject then

         dbms_output.put_line('... Skipping: ' || obj.object_name);

      else



         select deob_seq.nextval into nDescribedObjectId from dual;



         insert into da_described_objects

              ( DESCRIBED_OBJECT_ID           ,    --     NOT NULL  NUMBER(, )

                DESCRIPTION_SESSION_ID        ,    --     NOT NULL  NUMBER(, )

                OBJECT_NM                     ,    --     NOT NULL  VARCHAR2(128)

                CHILD_ITEM_COUNT                   --     NOT NULL  NUMBER(, )

              ) values (

                nDescribedObjectId,

                nDescriptionSessionId,

                obj.object_name,

                0

              );



         nObjectsAdded := nObjectsAdded + 1;



         nItemsFound := 0;



         if vObjectType = 'TABLE' then



            for grants in (select grantor, grantee, privilege, grantable, inherited

                             from table(ftGetObjectGrantList(vDatabaseName, 

                                                                           vSchemaName, 

                                                                           obj.object_name))

                           ) loop



               if(grants.grantor) <> 'No Grants Found.' then



                  select deog_seq.nextval into nDescribedObjectGrantId from dual;



                  insert into da_described_object_grants

                     ( DESCRIBED_OBJECT_GRANT_ID     ,     --     NOT NULL  NUMBER(, )

                        DESCRIBED_OBJECT_ID           ,    --     NOT NULL  NUMBER(, )

                        GRANTOR                       ,    --     NOT NULL  VARCHAR2(128)

                        GRANTEE                       ,    --     NOT NULL  VARCHAR2(128)

                        PRIVILEGE                     ,    --     NOT NULL  VARCHAR2(40)

                        GRANTABLE                     ,    --     NOT NULL  VARCHAR2(3)

                        INHERITED                          --     NOT NULL  VARCHAR2(3)

                     ) values (

                        nDescribedObjectGrantId,

                        nDescribedObjectId,

                        grants.grantor,

                        grants.grantee,

                        grants.privilege,

                        grants.grantable,

                        grants.inherited

                     );

               end if;



            end loop;



            for cols in (select column_id, column_name, 

                                data_type, data_length, 

                                data_precision, data_scale, nullable_yn, data_default

                           from table(ftGetTableColumnList(vDatabaseName, 

                                                                           vSchemaName, 

                                                                           obj.object_name))

                        ) loop



               select detc_seq.nextval into nDescribedTableColumnId from dual;



               insert into da_described_table_columns

                    ( DESCRIBED_TABLE_COLUMN_ID     ,    --     NOT NULL  NUMBER(, )

                      DESCRIBED_OBJECT_ID           ,    --               NUMBER(, )

                      COLUMN_NM                     ,    --               VARCHAR2(128)

                      COLUMN_ID                     ,    --               NUMBER(, )

                      DATA_TYPE                     ,    --  05           VARCHAR2(128)

                      DATA_LENGTH                   ,    --               NUMBER(, )

                      DATA_PRECISION                ,    --               NUMBER(, )

                      DATA_SCALE                    ,    --               NUMBER(, )

                      NULLABLE_YN                   ,    --               VARCHAR2(1)

                      DATA_DEFAULT                       --               VARCHAR2(100)

                    ) values (

                      nDescribedTableColumnId,

                      nDescribedObjectId,

                      cols.column_name,

                      cols.column_id,

                      cols.data_type,

                      cols.data_length,

                      cols.data_precision,

                      cols.data_scale,

                      cols.nullable_yn,

                      cols.data_default

                    );





               nItemsFound := nItemsFound + 1;



            end loop;



            update da_described_objects

               set child_item_count = nItemsFound

             where described_object_id = nDescribedObjectId;



            commit;



         elsif vObjectType = 'PACKAGE' then



            for grants in (select grantor, grantee, privilege, grantable, inherited

                             from table(ftGetObjectGrantList(vDatabaseName, 

                                                                           vSchemaName, 

                                                                           obj.object_name))

                           ) loop



               if(grants.grantor) <> 'No Grants Found.' then



                  select deog_seq.nextval into nDescribedObjectGrantId from dual;



                  insert into da_described_object_grants

                     ( DESCRIBED_OBJECT_GRANT_ID     ,     --     NOT NULL  NUMBER(, )

                        DESCRIBED_OBJECT_ID           ,    --     NOT NULL  NUMBER(, )

                        GRANTOR                       ,    --     NOT NULL  VARCHAR2(128)

                        GRANTEE                       ,    --     NOT NULL  VARCHAR2(128)

                        PRIVILEGE                     ,    --     NOT NULL  VARCHAR2(40)

                        GRANTABLE                     ,    --     NOT NULL  VARCHAR2(3)

                        INHERITED                          --     NOT NULL  VARCHAR2(3)

                     ) values (

                        nDescribedObjectGrantId,

                        nDescribedObjectId,

                        grants.grantor,

                        grants.grantee,

                        grants.privilege,

                        grants.grantable,

                        grants.inherited

                     );

               end if;



            end loop;



            for mods in (select *

                           from table(ftGetPackageModuleList(vDatabaseName, 

                                                                             vSchemaName, 

                                                                             obj.object_name))

                        ) loop



               select demo_seq.nextval into nDescribedModuleId from dual;



               insert into da_described_modules

                    ( DESCRIBED_MODULE_ID           ,    --     NOT NULL  NUMBER(, )

                      DESCRIBED_OBJECT_ID           ,    --               NUMBER(, )

                      MODULE_NM                     ,    --               VARCHAR2(128)

                      MODULE_ORDER_NO                    --               NUMBER(, )

                    ) values (

                      nDescribedModuleId,

                      nDescribedObjectId,

                      mods.module_name,

                      mods.position);



               nItemsFound := nItemsFound + 1;



              for params in (select *

                               from table(ftGetModuleParamList(vDatabaseName, 

                                                                               vSchemaName, 

                                                                               obj.object_name, 

                                                                               mods.module_name))

                            ) loop



                 insert into da_described_module_params

                      ( DESCRIBED_MODULE_PARAM_ID     ,    --     NOT NULL  NUMBER(, )

                        DESCRIBED_MODULE_ID           ,    --     NOT NULL  NUMBER(, )

                        PARAM_NM                      ,    --     NOT NULL  VARCHAR2(128)

                        PARAM_ORDER_NO                ,    --     NOT NULL  NUMBER(, )

                        PARAM_TYPE                    ,    --  05 NOT NULL  VARCHAR2(200)

                        PARAM_DIRECTION                    --     NOT NULL  VARCHAR2(3)

                      ) values (

                        demp_seq.nextval,

                        nDescribedModuleId,

                        params.argument_name,

                        params.position,

                        params.data_type,

                        params.in_out);



               end loop;



            end loop;



            update da_described_objects

               set child_item_count = nItemsFound

             where described_object_id = nDescribedObjectId;



         elsif vObjectType in ('PROCEDURE', 'FUNCTION') then



            select demo_seq.nextval into nDescribedModuleId from dual;



            insert into da_described_modules

                 ( DESCRIBED_MODULE_ID           ,    --     NOT NULL  NUMBER(, )

                   DESCRIBED_OBJECT_ID           ,    --               NUMBER(, )

                   MODULE_NM                     ,    --               VARCHAR2(128)

                   MODULE_ORDER_NO                    --               NUMBER(, )

                 ) values (

                   nDescribedModuleId,

                   nDescribedObjectId,

                   obj.object_name,

                   null);



            nItemsFound := nItemsFound + 1;



            for params in (select *

                             from table(ftGetModuleParamList(vDatabaseName, 

                                                                             vSchemaName, 

                                                                             null, 

                                                                             obj.object_name))

                           ) loop



               insert into da_described_module_params

                    ( DESCRIBED_MODULE_PARAM_ID     ,    --     NOT NULL  NUMBER(, )

                      DESCRIBED_MODULE_ID           ,    --     NOT NULL  NUMBER(, )

                      PARAM_NM                      ,    --     NOT NULL  VARCHAR2(128)

                      PARAM_ORDER_NO                ,    --     NOT NULL  NUMBER(, )

                      PARAM_TYPE                    ,    --  05 NOT NULL  VARCHAR2(200)

                      PARAM_DIRECTION                    --     NOT NULL  VARCHAR2(3)

                    ) values (

                      demp_seq.nextval,

                      nDescribedModuleId,

                      params.argument_name,

                      params.position,

                      params.data_type,

                      params.in_out);



            end loop;



	   elsif vObjectType = 'SEQUENCE' then



		for grants in (select grantor, grantee, privilege, grantable, inherited

                             from table(ftGetObjectGrantList(vDatabaseName, 

                                                                           vSchemaName, 

                                                                           obj.object_name))

                           ) loop



               if(grants.grantor) <> 'No Grants Found.' then



                  select deog_seq.nextval into nDescribedObjectGrantId from dual;



                  insert into da_described_object_grants

                     ( DESCRIBED_OBJECT_GRANT_ID     ,     --     NOT NULL  NUMBER(, )

                        DESCRIBED_OBJECT_ID           ,    --     NOT NULL  NUMBER(, )

                        GRANTOR                       ,    --     NOT NULL  VARCHAR2(128)

                        GRANTEE                       ,    --     NOT NULL  VARCHAR2(128)

                        PRIVILEGE                     ,    --     NOT NULL  VARCHAR2(40)

                        GRANTABLE                     ,    --     NOT NULL  VARCHAR2(3)

                        INHERITED                          --     NOT NULL  VARCHAR2(3)

                     ) values (

                        nDescribedObjectGrantId,

                        nDescribedObjectId,

                        grants.grantor,

                        grants.grantee,

                        grants.privilege,

                        grants.grantable,

                        grants.inherited

                     );

               end if;



            end loop;

	   end if;

      end if;

   end loop;


   if nObjectsAdded = 0 then

      dbms_output.put_line('COMPLETE - Zero objects were found  - completed at ' || to_char(sysdate, 'HH24:MI:SS'));

   else

      dbms_output.put_line('COMPLETE - Added ' || nObjectsAdded || ' objects - completed at ' || to_char(sysdate, 'HH24:MI:SS'));

   end if;



   commit;

exception



   when excIncompleteParams then

      dbms_output.put_line('ERROR: Parameter(s) ' || vErrorStr || ' were not specified.');



   when others then

      dbms_output.put_line('ERROR - ' || sqlerrm);



end prAddDescriptionSessionData;


procedure prDescribeMultipleSchemae     (pvEnvName                      IN     varchar2 := '',

                                         pvDatabaseName                 IN     varchar2 := '',

                                         pvSchemaName                   IN     varchar2 := '',

                                         pvObjectType                   IN     varchar2 := '')

       is



   vEnvName                       varchar2(100) := upper(ltrim(rtrim(pvEnvName)));           -- null if doing all environments

   vDatabaseName                  varchar2(100) := upper(ltrim(rtrim(pvDatabaseName)));      -- null if doing all databases

   vSchemaName                    varchar2(100) := upper(ltrim(rtrim(pvSchemaName)));        -- null if doing all schemae

   vObjectType                    varchar2(100) := upper(ltrim(rtrim(pvObjectType)));        -- null if doing all object types



begin



   for objType in (select object_type

                     from da_object_types objt

                    where objt.active_use_yn = 'Y'

                      and nvl(vObjectType, objt.object_type) = objt.object_type

                    order by objt.sort_order_no

                  ) loop



      for location in (select a.application_nm, e.environment_nm, d.database_nm, sdi.schema_nm, 

                              sdi.schema_nm || '@' || sdi.database_nm "DATABASE_LOCATION"

                         from da_schema_database_instances sdi,

                              da_schemas s,

                              da_applications a,

                              da_environments e,

                              da_databases d

                        where sdi.database_nm = d.database_nm

                          and nvl(vDatabaseName, d.database_nm) = d.database_nm

                          and d.active_use_yn = 'Y'

                          and sdi.environment_nm = e.environment_nm

                          and nvl(vEnvName, e.environment_nm) = e.environment_nm

                          and e.active_use_yn = 'Y'

                          and sdi.schema_nm = s.schema_nm

                          and s.application_nm = a.application_nm

                          and nvl(vSchemaName, s.schema_nm) = s.schema_nm

                          and a.active_use_yn = 'Y'

                          and s.active_use_yn = 'Y'

                        order by 1, e.sort_order_no, decode(sdi.database_nm, 'TRNJ', 100, 'TRNE', 200, 1), 3

                      ) loop



         prAddDescriptionSessionData(location.database_nm, location.schema_nm, objType.object_type);



      end loop;

   end loop;



exception



   when others then

      dbms_output.put_line('ERROR: ' || sqlerrm);



end prDescribeMultipleSchemae;



procedure prCompareSchemae              (pvDatabase1                    IN     varchar2,

                                         pvDatabase2                    IN     varchar2,

                                         pvSchemaName                   IN     varchar2,

                                         pvObjectType                   IN     varchar2)

       is



   vDatabase1                     varchar2(100) := upper(ltrim(rtrim(pvDatabase1)));

   vDatabase2                     varchar2(100) := upper(ltrim(rtrim(pvDatabase2)));

   vSchemaName                    varchar2(100) := upper(ltrim(rtrim(pvSchemaName)));

   vObjectType                    varchar2(100) := upper(ltrim(rtrim(pvObjectType)));



   nFoo                           number;

   vDivider1                      varchar2(200) := '=================================================================================';

   vDivider2                      varchar2(200) := '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -';



   tObjectName                    varchar2(30);

   tSubObjectName                 varchar2(30);



   nDifference1                   number := 0;

   nDifference2                   number := 0;

   nDifference3                   number := 0;

   nDifference4                   number := 0;

   nDifference5                   number := 0;

   vObjectTypeMixedCase           varchar2(128);

   vPadStr1                       varchar2(200);

   vPadStr2                       varchar2(200);

   vPadStr3                       varchar2(200);



   vErrorStr                      varchar2(200)  := '';

   vErrorSep                      varchar2(2)    := '';



   excNoObjectTypeFound           exception;

   excIncompleteParams            exception;



begin



   if vDatabase1 is null or vDatabase2 is null or vSchemaName is null or vObjectType is null then



      if vDatabase1 is null then

         vErrorStr := vErrorSep || 'DATABASE1';

         vErrorSep := ', ';

      end if;

      if vDatabase2 is null then

         vErrorStr := vErrorStr || vErrorSep || 'DATABASE2';

         vErrorSep := ', ';

      end if;

      if vSchemaName is null then

         vErrorStr := vErrorStr || vErrorSep || 'SCHEMA';

         vErrorSep := ', ';

      end if;

      if vObjectType is null then

         vErrorStr := vErrorStr || vErrorSep || 'OBJECT_TYPE';

         vErrorSep := ', ';

      end if;



      raise excIncompleteParams;

   end if;



   begin

      select object_type_mixed_case_nm 

        into vObjectTypeMixedCase

        from da_object_types

       where object_type = vObjectType;

   exception

      when no_data_found then

         raise excnoObjectTypeFound;

   end;



   if vObjectType = 'TABLE' then

      tSubObjectName := 'column';

   elsif vObjectType = 'PACKAGE' then

      tSubObjectName := 'module';

   elsif vObjectType in ('PROCEDURE', 'FUNCTION') then

      tSubObjectName := 'parameter';

   end if;



   dbms_output.put_line(vDivider1);

   dbms_output.put_line('COMPARING ' || vObjectTypeMixedCase || 's in ' || vSchemaName || '@' || vDatabase1 || ' vs ' || vSchemaName || '@' || vDatabase2);

   dbms_output.put_line(vDivider1);

   dbms_output.put_line(vDivider2);



   dbms_output.put_line('I) ' || vObjectTypeMixedCase || 's in ' || vSchemaName || '@' || vDatabase1 || ' but not in ' || vSchemaName || '@' || vDatabase2);



   -- First, get the objects that

   for x in (select deob.object_nm

               from da_described_objects deob,

                    da_description_sessions dese

              where dese.database_nm = vDatabase1

                and dese.schema_nm = vSchemaName

                and dese.object_type = vObjectType

                and dese.current_version_yn = 'Y'

                and deob.description_session_id = dese.description_session_id

              order by object_nm

            ) loop



      begin

         select deob.object_nm

           into tObjectName

           from da_described_objects deob,

                da_description_sessions dese

          where dese.database_nm = vDatabase2

            and dese.schema_nm = vSchemaName

            and dese.object_type = vObjectType

            and deob.object_nm = x.object_nm

            and dese.current_version_yn = 'Y'

            and deob.description_session_id = dese.description_session_id;

      exception

         when no_data_found then

            dbms_output.put_line('... FOUND: ' || vObjectTypeMixedCase || ' ' || x.object_nm);

            nDifference1 := nDifference1 + 1;

         when others then

            dbms_output.put_line('ERROR1: ' || x.object_nm || ' - ' || sqlerrm);

            raise;

      end;

   end loop;



   if nDifference1 = 0 then

      dbms_output.put_line('... None found.');

   end if;



   dbms_output.put_line(vDivider2);

   dbms_output.put_line('II) ' || vObjectTypeMixedCase || 's in ' || vSchemaName || '@' || vDatabase2 || ' but not in ' || vSchemaName || '@' || vDatabase1);





   for x in (select deob.object_nm

               from da_described_objects deob,

                    da_description_sessions dese

              where dese.database_nm = vDatabase2

                and dese.schema_nm = vSchemaName

                and dese.object_type = vObjectType

                and dese.current_version_yn = 'Y'

                and deob.description_session_id = dese.description_session_id

              order by deob.object_nm

            ) loop



      begin

         select deob.object_nm

           into tObjectName

           from da_described_objects deob,

                da_description_sessions dese

          where dese.database_nm = vDatabase1

            and dese.schema_nm = vSchemaName

            and dese.object_type = vObjectType

            and deob.object_nm = x.object_nm

            and dese.current_version_yn = 'Y'

            and deob.description_session_id = dese.description_session_id;



      exception

         when no_data_found then

            dbms_output.put_line('... FOUND: ' || vObjectTypeMixedCase || ' ' || x.object_nm);

            nDifference2 := nDifference2 + 1;

         when others then

            dbms_output.put_line('ERROR2: ' || sqlerrm);

            raise;

      end;

   end loop;



   if nDifference2 = 0 then

      dbms_output.put_line('... None found.');

   end if;



   dbms_output.put_line(vDivider2);

   dbms_output.put_line('III) ' || vObjectTypeMixedCase || 's in ' || vSchemaName || '@' || vDatabase1 || ' with differing ' || tSubObjectName || ' counts than in ' || vDatabase2);



   for x in (select deob1.object_nm, deob1.child_item_count "COUNT1", deob2.child_item_count "COUNT2"

               from da_described_objects deob1,

                    da_description_sessions dese1,

                    da_described_objects deob2,

                    da_description_sessions dese2

              where dese1.database_nm = vDatabase1

                and dese1.schema_nm = vSchemaName

                and dese1.object_type = vObjectType

                and dese1.current_version_yn = 'Y'

                and deob1.description_session_id = dese1.description_session_id

                and dese2.database_nm = vDatabase2

                and dese2.schema_nm = vSchemaName

                and dese2.object_type = vObjectType

                and dese2.current_version_yn = 'Y'

                and deob2.description_session_id = dese2.description_session_id

                and deob1.object_nm = deob2.object_nm

                and deob1.child_item_count <> deob2.child_item_count

              order by deob1.object_nm

            ) loop

      nDifference3 := nDifference3 + 1;



      vPadStr1 := fvGetStrPadChars(' ', 31 - length(x.object_nm));

      vPadStr2 := fvGetStrPadChars(' ', 4 - length(x.count1));

      vPadStr3 := fvGetStrPadChars(' ', 4 - length(x.count2));



      dbms_output.put_line('... ' || vObjectTypeMixedCase || ' ' || x.object_nm || vPadStr1 || vPadStr2 || x.count1 || ' ' || tSubObjectName || 's in ' || 

                              vDatabase1 || ', and ' || vPadStr3 || x.count2 || ' in ' || vDatabase2 || '.');



   end loop;



   if nDifference3 = 0 then

      dbms_output.put_line('... None found.');

   end if;



   dbms_output.put_line(vDivider2);

   dbms_output.put_line(vDivider1);

   dbms_output.put_line('SUMMARY OF ' || vObjectType || 'S IN ' || vDatabase1 || ' AND ' || vDatabase2);

   dbms_output.put_line('... Found in ' || vDatabase1 || ' but not in ' || vDatabase2 || ': ' || nDifference1);

   dbms_output.put_line('... Found in ' || vDatabase2 || ' but not in ' || vDatabase1 || ': ' || nDifference2);

   dbms_output.put_line('... Differing column counts in ' || vDatabase1 || ' vs ' || vDatabase2 || ': ' || nDifference3);

   dbms_output.put_line('COMPLETE'); 

   dbms_output.put_line(vDivider1);



   -- Retrieve the grants associated with the object type in the penultimate database specified.



   dbms_output.put_line(vDivider2);

   dbms_output.put_line('I) ' || vObjectTypeMixedCase || 's in ' || vSchemaName || '@' || vDatabase1 || ' with different grants than ' || vSchemaName || '@' || vDatabase2);



   for x in (select deob.object_nm, deog.grantor, deog.grantee, deog.privilege 

               from da_described_object_grants deog,

                    da_described_objects deob,

                    da_description_sessions dese

              where dese.database_nm = vDatabase1

                and dese.schema_nm = vSchemaName

                and dese.object_type = vObjectType

                and dese.current_version_yn = 'Y'

                and deob.description_session_id = dese.description_session_id

                and deog.described_object_id = deob.described_object_id

              order by object_nm, grantor

            ) loop



      begin



         select deob.object_nm

           into tObjectName

           from da_described_object_grants deog,

                da_described_objects deob,

                da_description_sessions dese

          where dese.database_nm = vDatabase2

            and dese.schema_nm = vSchemaName

            and dese.object_type = vObjectType

            and deob.object_nm = x.object_nm 

            --and deog.grantor = x.grantor 

            --and deog.grantee = x.grantee

            --and deog.privilege = x.privilege

            and dese.current_version_yn = 'Y'

            and deob.description_session_id = dese.description_session_id

            and deog.described_object_id = deob.described_object_id;

      exception

         when no_data_found then

            dbms_output.put_line('... FOUND: ' || vObjectTypeMixedCase || ' ' || x.object_nm);

            nDifference4 := nDifference4 + 1;

         when others then

            dbms_output.put_line('ERROR1: ' || x.object_nm || ' - ' || sqlerrm);

            raise;

      end;

   end loop;



   if nDifference4 = 0 then

      dbms_output.put_line('... None found.');

   end if;



exception

   when excnoObjectTypeFound then
      dbms_output.put_line('ERROR: Object type ''' || vObjectType || ''' is missing from the da_object_types table.');

   when excIncompleteParams then
      dbms_output.put_line('ERROR: Parameter(s) ' || vErrorStr || ' not specified.');

   when others then
      dbms_output.put_line('ERROR: ' || sqlerrm);

end prCompareSchemae;



end PKG_DA_DESCRIBE_KW;
