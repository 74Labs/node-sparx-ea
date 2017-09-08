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
