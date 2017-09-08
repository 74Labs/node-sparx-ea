select
c.Connector_ID as id,
c.Stereotype as type,
c.Start_Object_ID as source,
c.End_Object_ID as target
from
t_diagramlinks d
join t_connector c on c.Connector_ID = d.ConnectorID
where
d.DiagramID = @ID;
