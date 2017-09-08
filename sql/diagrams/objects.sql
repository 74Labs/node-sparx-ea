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
