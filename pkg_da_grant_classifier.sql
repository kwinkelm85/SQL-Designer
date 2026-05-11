create or replace package PKG_DA_GRANT_CLASSIFIER is

   procedure prClassifySessionGrantees (pnDescriptionSessionId IN NUMBER);

end PKG_DA_GRANT_CLASSIFIER;
/
sho err

create or replace package body PKG_DA_GRANT_CLASSIFIER is

   procedure prClassifySessionGrantees (pnDescriptionSessionId IN NUMBER) is
   
      vEnvironmentNm     varchar2(128);
      vSchemaNm          varchar2(128);
      vObjectTypeNm      varchar2(128);
      vStatement         varchar2(4000);
      nRoleCount         number;
      nUserCount         number;
      vClassification    varchar2(50);
      
      -- Cursor to get unique grantees for the session
      cursor c_grantees is
         select distinct g.grantee
           from da_described_object_grants g,
                da_described_objects o
          where g.described_object_id = o.described_object_id
            and o.description_session_id = pnDescriptionSessionId
          order by g.grantee;
          
   begin
      -- Get database name for the session to build db link
      begin
         select database_nm, schema_nm, object_type_nm 
           into vEnvironmentNm, vSchemaNm, vObjectTypeNm 
           from da_description_sessions 
          where description_session_id = pnDescriptionSessionId;
      exception
         when no_data_found then
            dbms_output.put_line('ERROR: Session ID ' || pnDescriptionSessionId || ' not found in DA_DESCRIPTION_SESSIONS.');
            return;
      end;
      
      dbms_output.put_line('--------------------------------------------------');
      dbms_output.put_line('Grantee Classification for Session ID: ' || pnDescriptionSessionId);
      dbms_output.put_line('Object Grants for: ' || vSchemaNm);
      dbms_output.put_line('Object Type: ' || vObjectTypeNm);
      dbms_output.put_line('Environment / DB Link: ' || vEnvironmentNm);
      dbms_output.put_line('--------------------------------------------------');
      
      -- Loop through each unique grantee
      for r_grantee in c_grantees loop
         
         nRoleCount := 0;
         nUserCount := 0;
         vClassification := 'UNKNOWN';
         
         -- Query DBA_ROLES
         begin
            vStatement := 'select count(*) from dba_roles@' || vEnvironmentNm || 
                          ' where role = ''' || r_grantee.grantee || '''';
            execute immediate vStatement into nRoleCount;
            
            if nRoleCount > 0 then
               vClassification := 'ROLE';
            else
               -- Query DBA_ROLE_PRIVS only if not found in DBA_ROLES
               vStatement := 'select count(*) from dba_role_privs@' || vEnvironmentNm || 
                             ' where grantee = ''' || r_grantee.grantee || '''';
               execute immediate vStatement into nUserCount;
               
               if nUserCount > 0 then
                  vClassification := 'USER';
               end if;
            end if;
         exception
            when others then
               if sqlcode = -942 then
                  vClassification := 'NOT FOUND';
               else
                  vClassification := 'ERROR: ' || sqlerrm;
               end if;
         end;
         
         -- Output result cleanly padded
         dbms_output.put_line(rpad(r_grantee.grantee, 40, ' ') || ' : ' || vClassification);
         
      end loop;
      
      dbms_output.put_line('--------------------------------------------------');
      dbms_output.put_line('Classification Complete.');
      
   end prClassifySessionGrantees;

end PKG_DA_GRANT_CLASSIFIER;
/
sho err
