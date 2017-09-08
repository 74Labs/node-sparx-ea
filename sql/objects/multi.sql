select
Object_ID as id,
Object_Type as base_type,
Stereotype as type,
Name as properties_name
from
t_object
order by
Name
offset (@OFFSET) rows
fetch next (@LIMIT) rows only
