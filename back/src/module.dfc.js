module.exports = () => {

    const
        fua            = global['fua'],
        hrt            = fua['core']['hrt'],
        uuid           = fua['core']['uuid'],
        Emitter        = require("event"),
        DataFlowRouter = /** class */ require("./module.dfr.js")()
    ; // const

    //region fn

    //endregion fn

    class DataFlowControl extends Emitter {

        #joinRule       = null;
        #dataFlowRouter = [];

        constructor(
            {
                '$data':               $data,
                'targetDataContainer': targetDataContainer = {'uri': null},
                'targetDataClass':     targetDataClass = {'uri': null},
                'joinRule':            joinRule = () => {
                },
                'provisioning':        provisioning = () => {

                },
                'dataFlowRouter':      dataFlowRouter = []

            }) {

            super(); // Emitter

            this.#joinRule       = joinRule;
            this.#dataFlowRouter = dataFlowRouter;

            Object.defineProperties(this, {
                '@context': {value: this.#context}
            }); // Object.defineProperties(this)

            // REM: clean up
            return this; // dataFlowControl
        } // constructor

        static get DataFlowRouter() {
            return DataFlowRouter;
        }

        get dataFlowRouter() {
            return this.#dataFlowRouter;
        }

        exec({
                 'rampSubjectIRI': /** NamedNode, IRI */ rampSubjectIRI = {'uri': null}
             }) {
            return new Promise((resolve, reject) => {
                try {

                    let dataTargetIRI,
                        dataTargetUri
                    ;
                    //region join or provisioning
                    // REM: es kann NUR EINEN GEBEN!!!
                    dataTargetIRI = $data.find(rampSubjectIRI, "fua:ramp_to_dataTarget_join", undefined);
                    if (dataTargetIRI.length === 0) {
                        // provision
                        dataTargetUri = `${targetDataContainer['uri']}${uuid()}`;
                        $data.create(rampSubjectIRI, "fua:ramp_to_dataTarget_join", {'uri': dataTargetUri});
                        $data.create(targetDataContainer, "ldp:contains", {'uri': dataTargetUri});

                        // REM : wenn das knallt, dann war die Anlage nicht korrekt: ES KANN (und hier: MUSS) einen geben...
                        dataTargetIRI = $data.find(rampSubjectIRI, "fua:ramp_to_dataTarget_join", undefined)[0];
                        if (!dataTargetIRI)
                            reject(new Error(`DataFlowControl : exec() : provisioning : dataTarget was NOT created.`));
                    } else if (dataTargetIRI.length === 1) {
                        dataTargetIRI = dataTargetIRI[0];
                    } else {
                        reject(new Error(`DataFlowControl : exec() : found more than one dataTarget (${dataTargetIRI.length})`))
                    }// if ()
                    //endregion join or provisioning

                    let
                        promises = []
                    ;
                    this.#dataFlowRouter.map((dfr) => {
                        promises.push(dfr['exec']({
                            'rampSubjectIRI':     rampSubjectIRI,
                            'rampSubjectTriples': $data.find(rampSubjectIRI, undefined, undefined),
                            'dataTargetIRI':      dataTargetIRI,
                            '$data':              this.#$dataProxy
                        }));
                    });
                    //Promise.all(promises).then(resolve).catch(reject);
                    Promise.all(promises).then((outputs) => {
                        outputs.map((output) => {
                            this.#data.create(output['triples']);
                            // REM: OR
                            //output['triples'].map((triple) => {
                            //    this.#data.create(triple);
                            //});
                        }); // outputs.map()
                    }).catch(reject);

                } catch (jex) {
                    reject(jex);
                } // try
            }); // rnP
        } // exec()

    } // class DataFlowControl

    Object.seal(DataFlowControl);

    return DataFlowControl;

}; // module.exports :: module.dfc

