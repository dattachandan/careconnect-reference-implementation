package uk.nhs.careconnect.ri.daointerface;

import ca.uhn.fhir.rest.param.DateRangeParam;
import ca.uhn.fhir.rest.param.ReferenceParam;
import org.hl7.fhir.dstu3.model.EpisodeOfCare;

import org.hl7.fhir.dstu3.model.IdType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import uk.nhs.careconnect.ri.daointerface.transforms.EpisodeOfCareEntityToFHIREpisodeOfCareTransformer;

import uk.nhs.careconnect.ri.entity.episode.EpisodeOfCareEntity;
import uk.nhs.careconnect.ri.entity.patient.PatientEntity;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.*;
import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

@Repository
@Transactional
public class EpisodeOfCareDao implements EpisodeOfCareRepository {

    @PersistenceContext
    EntityManager em;

    @Autowired
    private EpisodeOfCareEntityToFHIREpisodeOfCareTransformer episodeOfCareEntityToFHIREpisodeOfCareTransformer;


    @Override
    public void save(EpisodeOfCare episode) {

    }

    @Override
    public EpisodeOfCare read(IdType theId) {

        EpisodeOfCareEntity episode = (EpisodeOfCareEntity ) em.find(EpisodeOfCareEntity.class,Long.parseLong(theId.getIdPart()));

        return episode == null
                ? null
                : episodeOfCareEntityToFHIREpisodeOfCareTransformer.transform(episode);

    }

    @Override
    public EpisodeOfCare create(EpisodeOfCare episode, IdType theId, String theConditional) {
        return null;
    }

    @Override
    public List<EpisodeOfCare> search(ReferenceParam patient, DateRangeParam date) {

        List<EpisodeOfCareEntity> qryResults = searchEntity(patient, date);
        List<EpisodeOfCare> results = new ArrayList<>();

        for (EpisodeOfCareEntity episodeEntity : qryResults)
        {
            // log.trace("HAPI Custom = "+doc.getId());
            EpisodeOfCare episode = episodeOfCareEntityToFHIREpisodeOfCareTransformer.transform(episodeEntity);
            results.add(episode);
        }

        return results;
    }
    @Override
    public List<EpisodeOfCareEntity> searchEntity(ReferenceParam patient, DateRangeParam date) {
        List<EpisodeOfCareEntity> qryResults = null;

        CriteriaBuilder builder = em.getCriteriaBuilder();

        CriteriaQuery<EpisodeOfCareEntity> criteria = builder.createQuery(EpisodeOfCareEntity.class);
        Root<EpisodeOfCareEntity> root = criteria.from(EpisodeOfCareEntity.class);

        List<Predicate> predList = new LinkedList<Predicate>();
        List<EpisodeOfCare> results = new ArrayList<EpisodeOfCare>();

        if (patient != null) {
            Join<EpisodeOfCareEntity, PatientEntity> join = root.join("patient", JoinType.LEFT);

            Predicate p = builder.equal(join.get("id"),patient.getIdPart());
            predList.add(p);
        }


        Predicate[] predArray = new Predicate[predList.size()];
        predList.toArray(predArray);
        if (predList.size()>0)
        {
            criteria.select(root).where(predArray);
        }
        else
        {
            criteria.select(root);
        }

        qryResults = em.createQuery(criteria).getResultList();
        return qryResults;
    }
}