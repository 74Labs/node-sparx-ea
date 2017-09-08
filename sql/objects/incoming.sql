select
c.Connector_ID as rel_id,
c.Connector_Type as rel_base_type,
c.Stereotype as rel_type,
oo.Object_ID as node_id,
oo.Name as node_name,
oo.Object_Type as node_base_type,
oo.Stereotype as node_type
from
t_object o
join t_connector c on c.Start_Object_ID = o.Object_ID and c.Direction in ('Source -> Destination', 'Unspecified', 'Both')
join t_object oo on oo.Object_ID = c.End_Object_ID
where
o.Object_ID = @ID

union

select
c.Connector_ID as rel_id,
c.Connector_Type as rel_base_type,
c.Stereotype as rel_type,
oo.Object_ID as node_id,
oo.Name as node_name,
oo.Object_Type as node_base_type,
oo.Stereotype as node_type
from
t_object o
join t_connector c on c.End_Object_ID = o.Object_ID and c.Direction in ('Destination -> Source', 'Unspecified', 'Both')
join t_object oo on oo.Object_ID = c.Start_Object_ID
where
o.Object_ID = @ID;
