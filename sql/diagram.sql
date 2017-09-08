declare @ID int;
set @ID = %ID%;
select
Diagram_ID as id,
Name as name,
cx as x,
cy as y,
Scale as zoom
from
t_diagram
where
Diagram_ID = @ID;
select
o.Object_ID as id,
o.Name as name,
o.Stereotype as type,
d.RectLeft as x,
d.RectTop as y,
d.RectRight - d.RectLeft as w,
d.RectTop - d.RectBottom as h
from
t_diagramobjects d
join t_object o on o.Object_ID = d.Object_ID
where
d.Diagram_ID = @ID;
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
