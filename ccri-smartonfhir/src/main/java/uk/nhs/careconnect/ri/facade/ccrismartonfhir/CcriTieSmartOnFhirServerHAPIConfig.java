package uk.nhs.careconnect.ri.facade.ccrismartonfhir;


import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.context.FhirVersionEnum;
import ca.uhn.fhir.rest.api.EncodingEnum;
import ca.uhn.fhir.rest.server.FifoMemoryPagingProvider;
import ca.uhn.fhir.rest.server.HardcodedServerAddressStrategy;
import ca.uhn.fhir.rest.server.RestfulServer;
import ca.uhn.fhir.rest.server.interceptor.IServerInterceptor;
import ca.uhn.fhir.rest.server.interceptor.ResponseHighlighterInterceptor;
import ca.uhn.fhir.util.VersionUtil;
import org.springframework.beans.factory.annotation.Autowire;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import uk.nhs.careconnect.ri.facade.ccrismartonfhir.oauth2.OAuth2Interceptor;
import uk.nhs.careconnect.ri.lib.gateway.provider.*;
import uk.nhs.careconnect.ri.lib.server.ServerInterceptor;


import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.TimeZone;


public class CcriTieSmartOnFhirServerHAPIConfig extends RestfulServer {

	private static final long serialVersionUID = 1L;
	private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CcriTieSmartOnFhirServerHAPIConfig.class);

	private ApplicationContext applicationContext;

	CcriTieSmartOnFhirServerHAPIConfig(ApplicationContext context) {
		this.applicationContext = context;
	}

	@Value("http://127.0.0.1/STU3")
	private String serverBase;

    @Value("${fhir.resource.serverName}")
    private String serverName;

    @Value("${fhir.resource.serverVersion}")
    private String serverVersion;


    @Override
	public void addHeadersToResponse(HttpServletResponse theHttpResponse) {
		theHttpResponse.addHeader("X-Powered-By", "HAPI FHIR " + VersionUtil.getVersion() + " RESTful Server (INTEROPen Care Connect STU3)");
	}

	@SuppressWarnings("unchecked")
	@Override
	protected void initialize() throws ServletException {
		super.initialize();
		TimeZone.setDefault(TimeZone.getTimeZone("UTC"));


		FhirVersionEnum fhirVersion = FhirVersionEnum.DSTU3;
		setFhirContext(new FhirContext(fhirVersion));

	     if (serverBase != null && !serverBase.isEmpty()) {
            setServerAddressStrategy(new HardcodedServerAddressStrategy(serverBase));
        }

        if (applicationContext == null ) log.info("Context is null");

		// Get the spring context from the web container (it's declared in web.xml)              
		
		Config cfg = applicationContext.getBean(Config.class);

		String serverBase = cfg.getServerBase();
		String serverName = cfg.getServerName();
		String serverVersion = cfg.getServerVersion();
		String oauth2authorize = cfg.getOauth2authorize();
		String oauth2token = cfg.getOauth2token();
		String oauth2register = cfg.getOauth2register();

		log.info("serverBase: " + serverBase);
		log.info("oauth2authorize: " + oauth2authorize);
		log.info("oauth2token: " + oauth2token);
		log.info("oauth2register: " + oauth2register);
		log.info("serverName: " + serverName);
		log.info("serverVersion: " + serverVersion);

		setResourceProviders(Arrays.asList(
				applicationContext.getBean(PatientResourceProvider.class)
				,applicationContext.getBean(OrganisationResourceProvider.class)
				,applicationContext.getBean(PractitionerResourceProvider.class)
				,applicationContext.getBean(LocationResourceProvider.class)
				,applicationContext.getBean(PractitionerRoleResourceProvider.class)
				,applicationContext.getBean(ObservationResourceProvider.class) // Sprint 4 addition KGM
				,applicationContext.getBean(EncounterResourceProvider.class) // R3 addition KGM
				,applicationContext.getBean(ConditionResourceProvider.class) // R3 addition KGM
				,applicationContext.getBean(ProcedureResourceProvider.class) // R3 addition KGM
				,applicationContext.getBean(AllergyIntoleranceResourceProvider.class) // R3 addition KGM
				,applicationContext.getBean(MedicationRequestResourceProvider.class) // R3 addition KGM
				,applicationContext.getBean(MedicationStatementResourceProvider.class) // R3 addition KGM
				,applicationContext.getBean(ImmunizationResourceProvider.class) // R3 addition KGM
				,applicationContext.getBean(DocumentReferenceResourceProvider.class) // Unstructured
				,applicationContext.getBean(BinaryResourceProvider.class) // Unstructured
				,applicationContext.getBean(MedicationResourceProvider.class)

				,applicationContext.getBean(HealthcareServiceResourceProvider.class)
		));

		// Replace built in conformance provider (CapabilityStatement)
		setServerConformanceProvider(new CareConnectConformanceProvider(oauth2authorize
				,oauth2token
				,oauth2register, applicationContext));


		setServerName(serverName);
        setServerVersion(serverVersion);

		ServerInterceptor gatewayInterceptor = new ServerInterceptor(log);
		registerInterceptor(new OAuth2Interceptor());  // Add OAuth2 Security Filter
		registerInterceptor(gatewayInterceptor);

		FifoMemoryPagingProvider pp = new FifoMemoryPagingProvider(10);
		pp.setDefaultPageSize(10);
		pp.setMaximumPageSize(100);
		setPagingProvider(pp);

		setDefaultPrettyPrint(true);
		setDefaultResponseEncoding(EncodingEnum.JSON);

		FhirContext ctx = getFhirContext();
		// Remove as believe due to issues on docker ctx.setNarrativeGenerator(new DefaultThymeleafNarrativeGenerator());
	}

	/**
	 * This interceptor adds some pretty syntax highlighting in responses when a browser is detected
	 */
	@Bean(autowire = Autowire.BY_TYPE)
	public IServerInterceptor responseHighlighterInterceptor() {
		ResponseHighlighterInterceptor retVal = new ResponseHighlighterInterceptor();
		return retVal;
	}



}
