select
Diagram_ID as id,
Name as name
from
t_diagram
order by
Name
offset (@OFFSET) rows
fetch next (@LIMIT) rows only
