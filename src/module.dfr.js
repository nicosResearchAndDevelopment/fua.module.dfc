module.exports = () => {

    const
        fua  = global['fua'],
        hrt  = fua['core']['hrt'],
        uuid = fua['core']['uuid']
    ; // const

    //region fn
    function fn(source, output, next) {

    }

    //endregion fn

    class DataFlowRouter {

        #$data             = null;
        #$dataProxy        = null;
        #subject           = {'uri': null};
        #predicate         = {'uri': null};
        #send              = (output) => {
        };
        #dataFlowFunctions = []; // !!!

        constructor({
                        '$data':     $data,
                        'predicate': predicate = {'uri': null},
                        'send':      send = (output) => {
                        }
                    }) {

            if (typeof send !== "function")
                throw new Error((`DataFlowRouter: send is not a function.`));
            if (!subject['uri'])
                throw new Error((`DataFlowRouter: subject has no 'uri'.`));
            if (!predicate['uri'])
                throw new Error((`DataFlowRouter: predicate has no 'uri'.`));

            this.#$data      = $data;
            this.#$dataProxy = {'find': $data['find']};
            this.#subject    = subject;
            this.#predicate  = predicate;
            this.#send       = send;

            //Object.defineProperties(this, {
            //    '@context': {value: this.#context}
            //}); // Object.defineProperties(this)

        } // constructor

        use(fn) {
            if (typeof fn !== "function")
                throw new Error((`DataFlowRouter: parameter 'fn' is not a function.`));
            this.#dataFlowFunctions.push(fn);
        } // use

        exec({
                 'rampSubjectIRI': /** NamedNode, IRI */ rampSubject = {'uri': null},
                 'rampSubjectTriples':                rampSubjectTriples = [],
                 'dataTargetIRI':                     dataTargetIRI,
                 '$data':                             $data
             }) {
            return new Promise((resolve, reject) => {
                try {

                    const
                        source = {
                            'rampSubjectTriples': $data.find(rampSubject, null, null),
                            '$data':              this.#$dataProxy
                        },
                        length = this.#dataFlowFunctions.length,
                        next   = () => {
                            if (i > length)
                                this.#dataFlowFunctions[i++](source, output, next);
                            output['endedAt'] = hrt();
                            resolve(this.#send(output));
                        } // next()
                    ; // const
                    let
                        i      = 0,
                        output = {
                            'startetAt':   hrt(),
                            'rampSubject': rampSubject,
                            'triples':     []
                        } // output
                    ; // let
                    this.#dataFlowFunctions[i](source, output, next);
                } catch (jex) {
                    reject(jex);
                } // try
            }); // rnP
        } // exec()

        static get direct() {
            return ({'triples': triples}) => {
                this.#send(/** output */ {'triples': triples});
            }; // return
        } // direct()

    } // class DataFlowRouter

    Object.seal(DataFlowRouter);

    return DataFlowRouter;

}; // module.exports :: module.dfr

