define(['N/search'], function (search) {
    /**
     * Updates tax details for a given record.
     * @param {Record} rec - The record to update.
     */
    function updateTaxDetails(rec) {
        log.debug('Updating Tax Details for Record', rec.id);

        const taxDetailSublistId = 'taxdetails';

        var sublistDataItem = getSublistData(rec, 'item');
        var sublistDataExpense = getSublistData(rec, 'expense');

        if (sublistDataItem.length === 0
            && sublistDataExpense.length === 0) {
            log.debug('No Tax Details Found');
            return;
        }

        rec.setValue('taxdetailsoverride', true)
        clearExistingTaxDetails(rec, taxDetailSublistId);

        let sublistData = sublistDataItem.concat(sublistDataExpense);

        log.debug('Prepared Sublist Data', sublistData);

        sublistData.forEach((data, index) => {
            setSublistValues(rec, taxDetailSublistId, index, data);
        });

        log.debug('Tax Details Updated Successfully');
    }

    function getSublistData(rec, lineItemTypeId) {
        var sublistData = [];
        var sublistCount = rec.getLineCount(lineItemTypeId);
        for (var i = 0; i < sublistCount; i++) {
            var taxDetailsRef = rec.getSublistValue(lineItemTypeId, 'taxdetailsreference', i);
            let taxCode = rec.getSublistValue(lineItemTypeId, 'custcol_b10_tax_code', i);
            if (taxDetailsRef && taxCode) {
                sublistData.push({
                    taxCode: taxCode,
                    taxType: getTaxType(taxCode),
                    amount: rec.getSublistValue(lineItemTypeId, 'amount', i),
                    taxRate: rec.getSublistValue(lineItemTypeId, 'custcol_b10_tax_rate', i) || 0,
                    reference: taxDetailsRef
                });
            }
        }
        return sublistData;
    }

    function clearExistingTaxDetails(rec, taxDetailSublistId) {
        var existingLineCount = rec.getLineCount(taxDetailSublistId);
        for (var i = 0; i < existingLineCount; i++) {
            rec.removeLine({
                sublistId: taxDetailSublistId,
                line: 0
            });
        }
    }

    function setSublistValues(rec, sublistId, lineNum, data) {
        rec.insertLine({
            sublistId: sublistId,
            line: lineNum
        });
        rec.setSublistValue(sublistId, 'taxtype', lineNum, data.taxType);
        rec.setSublistValue(sublistId, 'taxcode', lineNum, data.taxCode);
        rec.setSublistValue(sublistId, 'taxbasis', lineNum, data.amount);
        rec.setSublistValue(sublistId, 'taxrate', lineNum, data.taxRate);
        rec.setSublistValue(sublistId, 'taxamount', lineNum, data.amount * (data.taxRate / 100));
        rec.setSublistValue(sublistId, 'taxdetailsreference', lineNum, data.reference);
    }

    function getTaxType(taxCodeId) {
        var taxType = '';
        try {
            var searchObj = search.create({
                type: 'salestaxitem',
                columns: ['taxtype'],
                filters: ['internalid', 'anyof', taxCodeId]
            });

            searchObj.run().each(function (result) {
                taxType = result.getValue({
                    name: 'taxtype'
                });

                return true;
            });

            log.debug('Fetched Tax Type', taxType);
        } catch (error) {
            log.error('Error Fetching Tax Type', error);
        }

        return taxType;
    }

    return {
        updateTaxDetails: updateTaxDetails
    };
});