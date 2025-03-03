/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['./../Module/b10SuiteTaxAutomation'], function (b10SuiteTaxAutomation) {

    function beforeSubmit(context) {
        var newRecord = context.newRecord;
        b10SuiteTaxAutomation.updateTaxDetails(newRecord);
    }

    return {
        beforeSubmit: beforeSubmit
    }
});