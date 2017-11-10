INSERT INTO `Organisation` (`ORGANISATION_ID`,`RES_DELETED`,`RES_CREATED`,`RES_MESSAGE_REF`,`RES_UPDATED`,`active`,`name`,`partOf`,`type`)
VALUES (200000,NULL,NULL,NULL,NULL,NULL,'Malton GP Practice',302,87);

INSERT INTO Practitioner(`PRACTITIONER_ID`,`gender`)
VALUES(200000,'MALE');
INSERT INTO Practitioner(`PRACTITIONER_ID`,`gender`)
VALUES(200001,'MALE');


INSERT INTO PractitionerName(`PRACTITIONER_ID`,`PRACTITIONER_NAME_ID`,`family_name`,`given_name`,`prefix`)
VALUES(200000,200000,'Gregory','Townley','Dr.');
INSERT INTO PractitionerName(`PRACTITIONER_ID`,`PRACTITIONER_NAME_ID`,`family_name`,`given_name`,`prefix`)
VALUES(200001,200001,'Samuel','Darwin','Dr.');

INSERT INTO PractitionerIdentifier(`PRACTITIONER_IDENTIFIER_ID`,`value`,`SYSTEM_ID`,`PRACTITIONER_ID`)
VALUES (200000,'G5612908', 5, 200000);
INSERT INTO PractitionerIdentifier(`PRACTITIONER_IDENTIFIER_ID`,`value`,`SYSTEM_ID`,`PRACTITIONER_ID`)
VALUES (200001,'C3456789', 5, 200001);

INSERT INTO `PractitionerRole` (`PRACTITIONER_ROLE_ID`,`managingOrganisation`,`PRACTITIONER_ID`,`role`) VALUES (200000,200000,200000,491);
INSERT INTO `PractitionerRole` (`PRACTITIONER_ROLE_ID`,`managingOrganisation`,`PRACTITIONER_ID`,`role`) VALUES (200001,39,200001,null);

INSERT INTO Patient (`PATIENT_ID`,`RES_DELETED`,`RES_CREATED`,`RES_MESSAGE_REF`,`RES_UPDATED`,`date_of_birth`,`gender`,`registration_end`,`registration_start`,`NHSverification`,`ethnic`,`GP_ID`,`marital`,`PRACTICE_ID`)
VALUES (4,NULL,NULL,NULL,NULL,'1965-12-13','FEMALE',NULL,NULL,79,38,200000,5,200000);

INSERT INTO PatientName (`PATIENT_ID`,`PATIENT_NAME_ID`,`family_name`,`given_name`,`prefix`,`nameUse`)
VALUES (4,5,'Smith','Fredrica','Mrs',0);


INSERT INTO PatientIdentifier
(`PATIENT_IDENTIFIER_ID`,`value`,`SYSTEM_ID`,`PATIENT_ID`)
VALUES (7,'3333333333', 1, 4);


INSERT INTO PatientTelecom(`PATIENT_TELECOM_ID`,`value`,`telecomUse`,`system`,`PATIENT_ID`)
VALUES (7,'+441234567890',0, 0, 4);


INSERT INTO `Address` (`ADDRESS_ID`,`RES_DELETED`,`RES_CREATED`,`RES_MESSAGE_REF`,`RES_UPDATED`,`address_1`,`address_2`,`address_3`,`address_4`,`address_5`,`city`,`county`,`postcode`)
VALUES (9,NULL,NULL,NULL,NULL,null,'29 West Avenue','Bury Thorpe','','','Malton','North Yorkshire','YO32 5TT');

INSERT INTO PatientAddress (`PATIENT_ADDRESS_ID`,`ADDRESS_ID`,`PATIENT_ID`,`addressUse`)
VALUES(5,9,4,1);



