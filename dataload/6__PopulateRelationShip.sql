-- isA only

insert into ConceptParentChildLink(relationshipId,REL_TYPE,CHILD_CONCEPT_ID,PARENT_CONCEPT_ID,CODESYSTEM_ID)
select r.id,0,s.CONCEPT_ID,d.CONCEPT_ID, 9
from careconnect.tempRelationship r
join Concept s on r.sourceId = s.CODE and s.CODESYSTEM_ID = 9
join Concept d on r.destinationId = d.CODE and d.CODESYSTEM_ID = 9
where
typeId = '116680003' and r.active=1 and r.id not in (select relationshipId from ConceptParentChildLink where relationshipId is not null);
