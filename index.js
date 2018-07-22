// Lambda Function code for Alexa.
// Paste this into your index.js file.

const Alexa = require("ask-sdk");
const https = require("https");
const request = require("request");


const invocationName = "local hockey";

// Session Attributes
//   Alexa will track attributes for you, by default only during the lifespan of your session.
//   The history[] array will track previous request(s), used for contextual Help/Yes/No handling.
//   Set up DynamoDB persistence to have the skill save and reload these attributes between skill sessions.

function getMemoryAttributes() {   const memoryAttributes = {
       "history":[],


       "launchCount":0,
       "lastUseTimestamp":0,

       "lastSpeechOutput":{},
       // "nextIntent":[]

       // "favoriteColor":"",
       // "name":"",
       // "namePronounce":"",
       // "email":"",
       // "mobileNumber":"",
       // "city":"",
       // "state":"",
       // "postcode":"",
       // "birthday":"",
       // "bookmark":0,
       // "wishlist":[],
   };
   return memoryAttributes;
};

const maxHistorySize = 20; // remember only latest 20 intents


// 1. Intent Handlers =============================================

const AMAZON_CancelIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_HelpIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let history = sessionAttributes['history'];
        let intents = getCustomIntents();
        let sampleIntent = randomElement(intents);

        let say = 'You asked for help. ';

        let previousIntent = getPreviousIntent(sessionAttributes);
        if (previousIntent && !handlerInput.requestEnvelope.session.new) {
             say += 'Your last intent was ' + previousIntent + '. ';
         }
        // say +=  'I understand  ' + intents.length + ' intents, '

        say += ' Here something you can ask me, ' + getSampleUtterance(sampleIntent);

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_StopIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const LocalHockeyGetLeagueLeader_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'LocalHockeyGetLeagueLeader' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from LocalHockeyGetLeagueLeader. ';
        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: team
        if (slotValues.team.heardAs && slotValues.team.heardAs !== '') {
            slotStatus += ' slot team was heard as ' + slotValues.team.heardAs + '. ';
        } else {
            slotStatus += 'slot team is empty. ';
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.team.resolved !== slotValues.team.heardAs) {
                slotStatus += 'synonym for ' + slotValues.team.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.team.heardAs + '" to the custom slot type used by slot team! ');
        }

        if( (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.team.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('LocalHockeyGetTeamStats','team'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LocalHockeyGetTeamPoints_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'LocalHockeyGetTeamPoints' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from LocalHockeyGetTeamPoints. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: team
        if (slotValues.team.heardAs && slotValues.team.heardAs !== '') {
            slotStatus += ' slot team was heard as ' + slotValues.team.heardAs + '. ';
        } else {
            slotStatus += 'slot team is empty. ';
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.team.resolved !== slotValues.team.heardAs) {
                slotStatus += 'synonym for ' + slotValues.team.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.team.heardAs + '" to the custom slot type used by slot team! ');
        }

        if( (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.team.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('LocalHockeyGetTeamPoints','team'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LocalHockeyGetTeamPosition_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'LocalHockeyGetTeamPosition' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from LocalHockeyGetTeamPosition. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: team
        if (slotValues.team.heardAs && slotValues.team.heardAs !== '') {
            slotStatus += ' slot team was heard as ' + slotValues.team.heardAs + '. ';
        } else {
            slotStatus += 'slot team is empty. ';
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.team.resolved !== slotValues.team.heardAs) {
                slotStatus += 'synonym for ' + slotValues.team.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.team.heardAs + '" to the custom slot type used by slot team! ');
        }

        if( (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.team.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('LocalHockeyGetTeamPosition','team'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LocalHockeyGetTeamStats_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'LocalHockeyGetTeamStats' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from LocalHockeyGetTeamStats. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: team
        if (slotValues.team.heardAs && slotValues.team.heardAs !== '') {
            slotStatus += ' slot team was heard as ' + slotValues.team.heardAs + '. ';
        } else {
            slotStatus += 'slot team is empty. ';
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.team.resolved !== slotValues.team.heardAs) {
                slotStatus += 'synonym for ' + slotValues.team.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.team.heardAs + '" to the custom slot type used by slot team! ');
        }

        if( (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.team.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('LocalHockeyGetTeamStats','team'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LocalHockeyGetLastResult_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'LocalHockeyGetLastResult' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from LocalHockeyGetLastResult. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: team
        if (slotValues.team.heardAs && slotValues.team.heardAs !== '') {
            slotStatus += ' slot team was heard as ' + slotValues.team.heardAs + '. ';
        } else {
            slotStatus += 'slot team is empty. ';
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.team.resolved !== slotValues.team.heardAs) {
                slotStatus += 'synonym for ' + slotValues.team.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.team.heardAs + '" to the custom slot type used by slot team! ');
        }

        if( (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.team.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('LocalHockeyGetLastResult','team'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LocalHockeyGetLastResultBetweenTeams_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'LocalHockeyGetLastResultBetweenTeams' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from LocalHockeyGetLastResultBetweenTeams. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: team
        if (slotValues.team.heardAs && slotValues.team.heardAs !== '') {
            slotStatus += ' slot team was heard as ' + slotValues.team.heardAs + '. ';
        } else {
            slotStatus += 'slot team is empty. ';
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.team.resolved !== slotValues.team.heardAs) {
                slotStatus += 'synonym for ' + slotValues.team.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.team.heardAs + '" to the custom slot type used by slot team! ');
        }

        if( (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.team.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('LocalHockeyGetLastResultBetweenTeams','team'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LocalHockeyGetNextFixture_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'LocalHockeyGetNextFixture' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from LocalHockeyGetNextFixture. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: team
        if (slotValues.team.heardAs && slotValues.team.heardAs !== '') {
            slotStatus += ' slot team was heard as ' + slotValues.team.heardAs + '. ';
        } else {
            slotStatus += 'slot team is empty. ';
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.team.resolved !== slotValues.team.heardAs) {
                slotStatus += 'synonym for ' + slotValues.team.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.team.heardAs + '" to the custom slot type used by slot team! ');
        }

        if( (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.team.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('LocalHockeyGetNextFixture','team'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LocalHockeyGetTeamTopScorer_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'LocalHockeyGetTeamTopScorer' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from LocalHockeyGetTeamTopScorer. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: team
        if (slotValues.team.heardAs && slotValues.team.heardAs !== '') {
            slotStatus += ' slot team was heard as ' + slotValues.team.heardAs + '. ';
        } else {
            slotStatus += 'slot team is empty. ';
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.team.resolved !== slotValues.team.heardAs) {
                slotStatus += 'synonym for ' + slotValues.team.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.team.heardAs + '" to the custom slot type used by slot team! ');
        }

        if( (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.team.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('LocalHockeyGetTeamTopScorer','team'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LocalHockeyGetRemainingFixtures_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'LocalHockeyGetRemainingFixtures' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from LocalHockeyGetRemainingFixtures. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: team
        if (slotValues.team.heardAs && slotValues.team.heardAs !== '') {
            slotStatus += ' slot team was heard as ' + slotValues.team.heardAs + '. ';
        } else {
            slotStatus += 'slot team is empty. ';
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.team.resolved !== slotValues.team.heardAs) {
                slotStatus += 'synonym for ' + slotValues.team.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.team.heardAs + '" to the custom slot type used by slot team! ');
        }

        if( (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.team.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('LocalHockeyGetRemainingFixtures','team'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LocalHockeyGetTeamGoalsFor_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'LocalHockeyGetTeamGoalsFor' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from LocalHockeyGetTeamGoalsFor. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: team
        if (slotValues.team.heardAs && slotValues.team.heardAs !== '') {
            slotStatus += ' slot team was heard as ' + slotValues.team.heardAs + '. ';
        } else {
            slotStatus += 'slot team is empty. ';
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.team.resolved !== slotValues.team.heardAs) {
                slotStatus += 'synonym for ' + slotValues.team.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.team.heardAs + '" to the custom slot type used by slot team! ');
        }

        if( (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.team.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('LocalHockeyGetTeamGoalsFor','team'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LocalHockeyGetTeamGoalsAgainst_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'LocalHockeyGetTeamGoalsAgainst' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from LocalHockeyGetTeamGoalsAgainst. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: team
        if (slotValues.team.heardAs && slotValues.team.heardAs !== '') {
            slotStatus += ' slot team was heard as ' + slotValues.team.heardAs + '. ';
        } else {
            slotStatus += 'slot team is empty. ';
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.team.resolved !== slotValues.team.heardAs) {
                slotStatus += 'synonym for ' + slotValues.team.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.team.heardAs + '" to the custom slot type used by slot team! ');
        }

        if( (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.team.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('LocalHockeyGetTeamGoalsAgainst','team'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LocalHockeyGetTeamWins_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'LocalHockeyGetTeamWins' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from LocalHockeyGetTeamWins. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: team
        if (slotValues.team.heardAs && slotValues.team.heardAs !== '') {
            slotStatus += ' slot team was heard as ' + slotValues.team.heardAs + '. ';
        } else {
            slotStatus += 'slot team is empty. ';
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.team.resolved !== slotValues.team.heardAs) {
                slotStatus += 'synonym for ' + slotValues.team.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.team.heardAs + '" to the custom slot type used by slot team! ');
        }

        if( (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.team.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('LocalHockeyGetTeamWins','team'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LocalHockeyGetTeamLosses_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'LocalHockeyGetTeamLosses' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from LocalHockeyGetTeamLosses. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: team
        if (slotValues.team.heardAs && slotValues.team.heardAs !== '') {
            slotStatus += ' slot team was heard as ' + slotValues.team.heardAs + '. ';
        } else {
            slotStatus += 'slot team is empty. ';
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.team.resolved !== slotValues.team.heardAs) {
                slotStatus += 'synonym for ' + slotValues.team.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.team.heardAs + '" to the custom slot type used by slot team! ');
        }

        if( (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.team.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('LocalHockeyGetTeamLosses','team'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LocalHockeyGetPlayedFixtures_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'LocalHockeyGetPlayedFixtures' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from LocalHockeyGetPlayedFixtures. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: team
        if (slotValues.team.heardAs && slotValues.team.heardAs !== '') {
            slotStatus += ' slot team was heard as ' + slotValues.team.heardAs + '. ';
        } else {
            slotStatus += 'slot team is empty. ';
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.team.resolved !== slotValues.team.heardAs) {
                slotStatus += 'synonym for ' + slotValues.team.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.team.heardAs + '" to the custom slot type used by slot team! ');
        }

        if( (slotValues.team.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.team.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('LocalHockeyGetPlayedFixtures','team'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LaunchRequest_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;

        let say = 'hello' + ' and welcome to ' + invocationName + ' ! Say help to hear some options.';

        let skillTitle = capitalize(invocationName);

        if (supportsDisplay(handlerInput)) {
            const myImage1 = new Alexa.ImageHelper()
               .addImageInstance(DisplayImg1.url)
               .getImage();

            const myImage2 = new Alexa.ImageHelper()
               .addImageInstance(DisplayImg2.url)
               .getImage();

            const primaryText = new Alexa.RichTextContentHelper()
               .withPrimaryText('Welcome to the skill!')
               .getTextContent();

            responseBuilder.addRenderTemplateDirective({
               type : 'BodyTemplate2',
               token : 'string',
               backButton : 'HIDDEN',
               backgroundImage: myImage2,
               image: myImage1,
               title: skillTitle,
               textContent: primaryText,
             });
        }

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .withStandardCard('Welcome!',
              'Hello!\nThis is a card for your skill, ' + skillTitle,
               welcomeCardImg.smallImageUrl, welcomeCardImg.largeImageUrl)
            .getResponse();
    },
};

const SessionEndedHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler =  {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const request = handlerInput.requestEnvelope.request;

        console.log(`Error handled: ${error.message}`);
        // console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);

        return handlerInput.responseBuilder
            .speak(`Sorry, your skill got this error.  ${error.message} `)
            .reprompt(`Sorry, your skill got this error.  ${error.message} `)
            .getResponse();
    }
};


// 2. Constants ===========================================================================

    // Here you can define static data, to be used elsewhere in your code.  For example:
    //    const myString = "Hello World";
    //    const myArray  = [ "orange", "grape", "strawberry" ];
    //    const myObject = { "city": "Boston",  "state":"Massachusetts" };

const APP_ID = "amzn1.ask.skill.59b09b88-6a43-4cd8-9248-94e78ddf73a1";  // TODO replace with your Skill ID (OPTIONAL).

// 3.  Helper Functions ===================================================================

function url(){
  return "https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch=Albert+Einstein";
}

function getJSON(callback){
  request.get(url(), function(error,response,body){
    var d = JSON.parse(body);
    var result = d.query.searchinfo.totalhits;
    if (result > 0){
      callback(result);
    }else{
      callback("ERROR");
    }
  })
}

function capitalize(myString) {

     return myString.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); }) ;
}


function randomElement(myArray) {
    return(myArray[Math.floor(Math.random() * myArray.length)]);
}

function stripSpeak(str) {
    return(str.replace('<speak>', '').replace('</speak>', ''));
}




function getSlotValues(filledSlots) {
    const slotValues = {};

    Object.keys(filledSlots).forEach((item) => {
        const name  = filledSlots[item].name;

        if (filledSlots[item] &&
            filledSlots[item].resolutions &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
                case 'ER_SUCCESS_MATCH':
                    slotValues[name] = {
                        heardAs: filledSlots[item].value,
                        resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                        ERstatus: 'ER_SUCCESS_MATCH'
                    };
                    break;
                case 'ER_SUCCESS_NO_MATCH':
                    slotValues[name] = {
                        heardAs: filledSlots[item].value,
                        resolved: '',
                        ERstatus: 'ER_SUCCESS_NO_MATCH'
                    };
                    break;
                default:
                    break;
            }
        } else {
            slotValues[name] = {
                heardAs: filledSlots[item].value || '', // may be null
                resolved: '',
                ERstatus: ''
            };
        }
    }, this);

    return slotValues;
}

function getExampleSlotValues(intentName, slotName) {

    let examples = [];
    let slotType = '';
    let slotValuesFull = [];

    let intents = model.interactionModel.languageModel.intents;
    for (let i = 0; i < intents.length; i++) {
        if (intents[i].name == intentName) {
            let slots = intents[i].slots;
            for (let j = 0; j < slots.length; j++) {
                if (slots[j].name === slotName) {
                    slotType = slots[j].type;

                }
            }
        }

    }
    let types = model.interactionModel.languageModel.types;
    for (let i = 0; i < types.length; i++) {
        if (types[i].name === slotType) {
            slotValuesFull = types[i].values;
        }
    }

    slotValuesFull = shuffleArray(slotValuesFull);

    examples.push(slotValuesFull[0].name.value);
    examples.push(slotValuesFull[1].name.value);
    if (slotValuesFull.length > 2) {
        examples.push(slotValuesFull[2].name.value);
    }


    return examples;
}

function sayArray(myData, penultimateWord = 'and') {
    let result = '';

    myData.forEach(function(element, index, arr) {

        if (index === 0) {
            result = element;
        } else if (index === myData.length - 1) {
            result += ` ${penultimateWord} ${element}`;
        } else {
            result += `, ${element}`;
        }
    });
    return result;
}

function supportsDisplay(handlerInput) { // returns true if the skill is running on a device with a display (Echo Show, Echo Spot, etc.)
                                         //  Enable your skill for display as shown here: https://alexa.design/enabledisplay
    const hasDisplay =
        handlerInput.requestEnvelope.context &&
        handlerInput.requestEnvelope.context.System &&
        handlerInput.requestEnvelope.context.System.device &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;

    return hasDisplay;
}


const welcomeCardImg = {
    smallImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane720_480.png",
    largeImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane1200_800.png"


};

const DisplayImg1 = {
    title: 'Jet Plane',
    url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png'
};
const DisplayImg2 = {
    title: 'Starry Sky',
    url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png'

};

function getCustomIntents() {
    const modelIntents = model.interactionModel.languageModel.intents;

    let customIntents = [];


    for (let i = 0; i < modelIntents.length; i++) {

        if(modelIntents[i].name.substring(0,7) != "AMAZON." && modelIntents[i].name !== "LaunchRequest" ) {
            customIntents.push(modelIntents[i]);
        }
    }
    return customIntents;
}

function getSampleUtterance(intent) {

    return randomElement(intent.samples);

}

function getPreviousIntent(attrs) {

    if (attrs.history && attrs.history.length > 1) {
        return attrs.history[attrs.history.length - 2].IntentRequest;

    } else {
        return false;
    }

}

function getPreviousSpeechOutput(attrs) {

    if (attrs.lastSpeechOutput && attrs.history.length > 1) {
        return attrs.lastSpeechOutput;

    } else {
        return false;
    }

}

function timeDelta(t1, t2) {

    const dt1 = new Date(t1);
    const dt2 = new Date(t2);
    const timeSpanMS = dt2.getTime() - dt1.getTime();
    const span = {
        "timeSpanMIN": Math.floor(timeSpanMS / (1000 * 60 )),
        "timeSpanHR": Math.floor(timeSpanMS / (1000 * 60 * 60)),
        "timeSpanDAY": Math.floor(timeSpanMS / (1000 * 60 * 60 * 24)),
        "timeSpanDesc" : ""
    };


    if (span.timeSpanHR < 2) {
        span.timeSpanDesc = span.timeSpanMIN + " minutes";
    } else if (span.timeSpanDAY < 2) {
        span.timeSpanDesc = span.timeSpanHR + " hours";
    } else {
        span.timeSpanDesc = span.timeSpanDAY + " days";
    }


    return span;

}


const InitMemoryAttributesInterceptor = {
    process(handlerInput) {
        let sessionAttributes = {};
        if(handlerInput.requestEnvelope.session['new']) {

            sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

            let memoryAttributes = getMemoryAttributes();

            if(Object.keys(sessionAttributes).length === 0) {

                Object.keys(memoryAttributes).forEach(function(key) {  // initialize all attributes from global list

                    sessionAttributes[key] = memoryAttributes[key];

                });

            }
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);


        }
    }
};

const RequestHistoryInterceptor = {
    process(handlerInput) {

        const thisRequest = handlerInput.requestEnvelope.request;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let history = sessionAttributes['history'] || [];

        let IntentRequest = {};
        if (thisRequest.type === 'IntentRequest' ) {

            let slots = [];

            IntentRequest = {
                'IntentRequest' : thisRequest.intent.name
            };

            if (thisRequest.intent.slots) {

                for (let slot in thisRequest.intent.slots) {
                    let slotObj = {};
                    slotObj[slot] = thisRequest.intent.slots[slot].value;
                    slots.push(slotObj);
                }

                IntentRequest = {
                    'IntentRequest' : thisRequest.intent.name,
                    'slots' : slots
                };

            }

        } else {
            IntentRequest = {'IntentRequest' : thisRequest.type};
        }
        if(history.length > maxHistorySize - 1) {
            history.shift();
        }
        history.push(IntentRequest);

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    }

};




const RequestPersistenceInterceptor = {
    process(handlerInput) {

        if(handlerInput.requestEnvelope.session['new']) {

            return new Promise((resolve, reject) => {

                handlerInput.attributesManager.getPersistentAttributes()

                    .then((sessionAttributes) => {
                        sessionAttributes = sessionAttributes || {};


                        sessionAttributes['launchCount'] += 1;

                        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

                        handlerInput.attributesManager.savePersistentAttributes()
                            .then(() => {
                                resolve();
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    });

            });

        } // end session['new']
    }
};


const ResponseRecordSpeechOutputInterceptor = {
    process(handlerInput, responseOutput) {

        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let lastSpeechOutput = {
            "outputSpeech":responseOutput.outputSpeech.ssml,
            "reprompt":responseOutput.reprompt.outputSpeech.ssml
        };

        sessionAttributes['lastSpeechOutput'] = lastSpeechOutput;

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    }
};

const ResponsePersistenceInterceptor = {
    process(handlerInput, responseOutput) {

        const ses = (typeof responseOutput.shouldEndSession == "undefined" ? true : responseOutput.shouldEndSession);

        if(ses || handlerInput.requestEnvelope.request.type == 'SessionEndedRequest') { // skill was stopped or timed out

            let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

            sessionAttributes['lastUseTimestamp'] = new Date(handlerInput.requestEnvelope.request.timestamp).getTime();

            handlerInput.attributesManager.setPersistentAttributes(sessionAttributes);

            return new Promise((resolve, reject) => {
                handlerInput.attributesManager.savePersistentAttributes()
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });

            });

        }

    }
};


function shuffleArray(array) {  // Fisher Yates shuffle!

    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
// 4. Exports handler function and setup ===================================================
const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
    .addRequestHandlers(
        AMAZON_CancelIntent_Handler,
        AMAZON_HelpIntent_Handler,
        AMAZON_StopIntent_Handler,
        LocalHockeyGetLeagueLeader_Handler,
        LocalHockeyGetTeamPoints_Handler,
        LocalHockeyGetTeamPosition_Handler,
        LocalHockeyGetTeamStats_Handler,
        LocalHockeyGetLastResult_Handler,
        LocalHockeyGetLastResultBetweenTeams_Handler,
        LocalHockeyGetNextFixture_Handler,
        LocalHockeyGetTeamTopScorer_Handler,
        LocalHockeyGetRemainingFixtures_Handler,
        LocalHockeyGetTeamGoalsFor_Handler,
        LocalHockeyGetTeamGoalsAgainst_Handler,
        LocalHockeyGetTeamWins_Handler,
        LocalHockeyGetTeamLosses_Handler,
        LocalHockeyGetPlayedFixtures_Handler,
        LaunchRequest_Handler,
        SessionEndedHandler
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(InitMemoryAttributesInterceptor)
    .addRequestInterceptors(RequestHistoryInterceptor)

   // .addResponseInterceptors(ResponseRecordSpeechOutputInterceptor)

 // .addRequestInterceptors(RequestPersistenceInterceptor)
 // .addResponseInterceptors(ResponsePersistenceInterceptor)

 // .withTableName("askMemorySkillTable")
 // .withAutoCreateTable(true)

    .lambda();


// End of Skill code -------------------------------------------------------------
// Static Language Model for reference

const model = {
  "interactionModel": {
    "languageModel": {
      "invocationName": "local hockey",
      "intents": [
        {
          "name": "AMAZON.CancelIntent",
          "samples": []
        },
        {
          "name": "AMAZON.HelpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.StopIntent",
          "samples": []
        },
        {
          "name": "LocalHockeyGetLeagueLeader",
          "slots": [],
          "samples": [
            "who is winning the league",
            "who is top of the league",
            "who's top of the league",
            "which team is top of the league"
          ]
        },
        {
          "name": "LocalHockeyGetTeamPoints",
          "slots": [
            {
              "name": "team",
              "type": "team"
            }
          ],
          "samples": [
            "how many points do {team} have",
            "how many points have {team} got",
            "tell me how many points {team} have"
          ]
        },
        {
          "name": "LocalHockeyGetTeamPosition",
          "slots": [
            {
              "name": "team",
              "type": "team"
            }
          ],
          "samples": [
            "where are {team} in the league",
            "what position are {team}",
            "how is {team} doing",
            "how are {team} doing in the league"
          ]
        },
        {
          "name": "LocalHockeyGetTeamStats",
          "slots": [
            {
              "name": "team",
              "type": "team"
            }
          ],
          "samples": [
            "tell me the stats for {team}",
            "tell me {team} stats"
          ]
        },
        {
          "name": "LocalHockeyGetLastResult",
          "slots": [
            {
              "name": "team",
              "type": "team"
            }
          ],
          "samples": [
            "what was the result of {team} last match",
            "did {team} win their last game",
            "did {team} win last time",
            "did {team} win last week",
            "how did {team} get on",
            "how did {team} do last time"
          ]
        },
        {
          "name": "LocalHockeyGetLastResultBetweenTeams",
          "slots": [
            {
              "name": "team",
              "type": "team"
            }
          ],
          "samples": [
            "what was the previous result between {team} and {team}",
            "how did {team} get on against {team}",
            "who won the last game between {team} and {team}"
          ]
        },
        {
          "name": "LocalHockeyGetNextFixture",
          "slots": [
            {
              "name": "team",
              "type": "team"
            }
          ],
          "samples": [
            "what time is {team}  next match",
            "what date is {team}  next match",
            "when is {team}  next match",
            "what is the next match for {team}",
            "who are {team} playing next week",
            "who are {team} playing against next",
            "who are {team}  next opponents",
            "who do {team} play next",
            "what is {team}  next match",
            "what is the next fixture for {team}"
          ]
        },
        {
          "name": "LocalHockeyGetTeamTopScorer",
          "slots": [
            {
              "name": "team",
              "type": "team"
            }
          ],
          "samples": [
            "tell me {team}  top scorer",
            "who is top scorer for {team}",
            "what player has the most goals for {team}",
            "who has got the most goals for {team}",
            "who is the top goal scorer for {team}"
          ]
        },
        {
          "name": "LocalHockeyGetRemainingFixtures",
          "slots": [
            {
              "name": "team",
              "type": "team"
            }
          ],
          "samples": [
            "how many games do {team} have left to play",
            "how many matches do {team} have left to play",
            "what teams do {team} still have to play",
            "how many matches do {team} have left",
            "what are the remaining fixtures for {team}",
            "how many fixtures do {team} have left to play"
          ]
        },
        {
          "name": "LocalHockeyGetTeamGoalsFor",
          "slots": [
            {
              "name": "team",
              "type": "team"
            }
          ],
          "samples": [
            "how many goals have {team} scored this season",
            "how many goals have {team} scored"
          ]
        },
        {
          "name": "LocalHockeyGetTeamGoalsAgainst",
          "slots": [
            {
              "name": "team",
              "type": "team"
            }
          ],
          "samples": [
            "how many goals have {team} conceded this season",
            "how many goals have {team} let in",
            "how many goals have {team} conceded"
          ]
        },
        {
          "name": "LocalHockeyGetTeamWins",
          "slots": [
            {
              "name": "team",
              "type": "team"
            }
          ],
          "samples": [
            "how many wins have {team} got this season",
            "how many wins have {team} got",
            "how many games have {team} won"
          ]
        },
        {
          "name": "LocalHockeyGetTeamLosses",
          "slots": [
            {
              "name": "team",
              "type": "team"
            }
          ],
          "samples": [
            "how many games have {team} drawn",
            "how many draws have {team} got this season",
            "how many draws have {team} got"
          ]
        },
        {
          "name": "LocalHockeyGetPlayedFixtures",
          "slots": [
            {
              "name": "team",
              "type": "team"
            }
          ],
          "samples": [
            "how many fixtures have {team} had already",
            "how many games have {team} played",
            "how many matches have {team} played already"
          ]
        },
        {
          "name": "LaunchRequest"
        }
      ],
      "types": [
        {
          "name": "team",
          "values": [
            {
              "name": {
                "value": "Annadale",
                "synonyms": [
                  "Dale's",
                  "Annadale's",
                  "Dale"
                ]
              }
            },
            {
              "name": {
                "value": "Antrim",
                "synonyms": [
                  "Antrim's"
                ]
              }
            },
            {
              "name": {
                "value": "Armagh",
                "synonyms": [
                  "Armagh's"
                ]
              }
            },
            {
              "name": {
                "value": "Ballymena",
                "synonyms": [
                  "Ballymena's"
                ]
              }
            },
            {
              "name": {
                "value": "Ballynahinch",
                "synonyms": [
                  "Ballynahinch's"
                ]
              }
            },
            {
              "name": {
                "value": "Banbridge",
                "synonyms": [
                  "Bann's",
                  "Banbridge's",
                  "Bann"
                ]
              }
            },
            {
              "name": {
                "value": "Bangor",
                "synonyms": [
                  "Bangor's"
                ]
              }
            },
            {
              "name": {
                "value": "Belfast-Harlequins",
                "synonyms": [
                  "Harlequins'",
                  "Harlequins"
                ]
              }
            },
            {
              "name": {
                "value": "Cliftonville",
                "synonyms": [
                  "Cliftonville's"
                ]
              }
            },
            {
              "name": {
                "value": "Cookstown",
                "synonyms": [
                  "Cookstown's"
                ]
              }
            },
            {
              "name": {
                "value": "Down",
                "synonyms": [
                  "Down's"
                ]
              }
            },
            {
              "name": {
                "value": "Instonians",
                "synonyms": [
                  "Instonians'",
                  "Inst's",
                  "Inst"
                ]
              }
            },
            {
              "name": {
                "value": "Kilkeel",
                "synonyms": [
                  "Kilkeel's"
                ]
              }
            },
            {
              "name": {
                "value": "Lisnagarvey",
                "synonyms": [
                  "Garvey's",
                  "Lisnagarvey's",
                  "Garvey"
                ]
              }
            },
            {
              "name": {
                "value": "Mossley",
                "synonyms": [
                  "Mossley's"
                ]
              }
            },
            {
              "name": {
                "value": "Newry-Olympic",
                "synonyms": [
                  "Newry's",
                  "Newry"
                ]
              }
            },
            {
              "name": {
                "value": "NICS",
                "synonyms": [
                  "NICS'",
                  "Civil Service's",
                  "Civil's",
                  "Civil",
                  "Civil Service"
                ]
              }
            },
            {
              "name": {
                "value": "North-Down",
                "synonyms": [
                  "North Down's"
                ]
              }
            },
            {
              "name": {
                "value": "Parkview",
                "synonyms": [
                  "Parkview's"
                ]
              }
            },
            {
              "name": {
                "value": "Portadown",
                "synonyms": [
                  "Portadown's"
                ]
              }
            },
            {
              "name": {
                "value": "Portrush"
              }
            },
            {
              "name": {
                "value": "PSNI"
              }
            },
            {
              "name": {
                "value": "Queens"
              }
            },
            {
              "name": {
                "value": "Raphoe"
              }
            },
            {
              "name": {
                "value": "Saintfield"
              }
            },
            {
              "name": {
                "value": "South Antrim"
              }
            }
          ]
        }
      ]
    }
  }
};
