/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */

/**
 * THINGS TO WATCH OUT FOR:
 * some fields are strings, others are numbers, for instance, when we have avg, we want courses_avg
 * object.children & object[i].children not the same -> usually i = 0 when you need to use this
 * If whereblock only has 1 field, makes no sense to have AND
 * In the case where NONE is selected, need to include the field
 */

// global store
courses = ["Audit", "ID", "UUID", "Average", "Year", "Instructor", "Department", "Pass", "Fail", "Title"];
rooms = ["Address", "Latitude", "Seats", "Full Name", "Longitude", "Short Name", "Furniture", "Name", "Type",
"Link", "Number"];
numericVals = ["lat", "lon", "seats", "avg", "pass", "fail", "audit", "year"];

// handle conditions
handleConditions = (conditions, datatype) => {
    let conditionType = conditions[0].getElementsByClassName("control-group condition-type");
    //var andCheck = conditions[0].getElementById("courses-conditiontype-all");
    let condInput = conditionType[0].getElementsByTagName("input");
    let condArr = {};
    let type = "";
    if (condInput[0].checked) {
        // all check - and
        type = "AND";
    } else if (condInput[1].checked) {
        // any check - or
        type = "OR";
    } else if (condInput[2].checked) {
        // none check - not
        type = "NOT";
    }
    let notObj = {};
    let typeObj = [];
    if (type != "NOT") {
        condArr[type] = typeObj;
    } else {
        notObj["OR"] = typeObj;
        condArr["NOT"] = notObj;
    }

    let cond = conditions[0].getElementsByClassName("conditions-container");
    let conditionsGroup = cond[0].children;
    for (let i = 0; i < conditionsGroup.length; i++) {
        let innerCond = conditionsGroup[i].getElementsByClassName("control");
        let not = false;
        if (innerCond[0].getElementsByTagName("input")[0].checked) {
            // not
            not = true;
        }
        let selectedField = innerCond[1].getElementsByTagName("select")[0].value;
        let operators = innerCond[2].getElementsByTagName("select")[0];
        let selectedOperator = operators.options[operators.selectedIndex].text;
        let term = innerCond[3].getElementsByTagName("input")[0].value;
        if (numericVals.includes(selectedField)) {
            term = parseInt(term);
        }
        let obj = {};
        obj[datatype + "_" + selectedField] = term;
        // if NOT, requires one more object encapsulation
        if (not) {
            let notObj = {};
            notObj[selectedOperator] = obj;
            let innerObj = {};
            innerObj["NOT"] = notObj;
            typeObj.push(innerObj);
        } else {
            let innerObj = {};
            innerObj[selectedOperator] = obj;
            typeObj.push(innerObj);
        }
    };
    if (typeObj.length == 1) {
        return typeObj[0];
    }
    if (typeObj.length == 0) {
        return {};
    }
    return condArr;
}

// handle columns
handleColumns = (columns, datatype) => {
    // get all input tag elements & see if they're checked, if yes add to array
    let column = columns[0].getElementsByTagName("input");
    let labels = columns[0].getElementsByTagName("label");
    let checkedArr = [];
    for (let i = 0; i < column.length; i++) {
        if (column[i].checked) {
            if (courses.includes(labels[i].textContent) || rooms.includes(labels[i].textContent)) {
                checkedArr.push(datatype + "_" + column[i].value);
            } else {
                checkedArr.push(column[i].value);
            }
        }
    }
    return checkedArr;
}

// handle order
handleOrder = (order, datatype) => {
    let descendingBool = false; // order is descending or not?
    let orderCols = [];

    const orderFields = order.children[0].children[0];
    const descending = order.children[1];

    // handle descending
    if (descending.children[0].checked == true) {
        descendingBool = true; // set order to descending
    }

    // iterate over selected and check
    for (let i = 0; i < orderFields.length; i++) {
        const field = orderFields[i];
        if (field.attributes.selected !== undefined) {
            let label = field.label;
            if (rooms.includes(label) || courses.includes(label)) {
                label = label.replace(/\s+/g, '');
                orderCols.push(datatype + "_" + orderFields[i].value);
            } else {
                orderCols.push(orderFields[i].value);
            }
        }
        // do nothing
    }
    if (!descendingBool) {
        /*if (orderCols.length <= 1) {
            return orderCols[0];
        } else {
            return {dir:"UP", keys: orderCols};
        }*/
        return {dir:"UP", keys: orderCols};
    } else {
        return {dir:"DOWN", keys:orderCols};
    }
}

// handle groups
handleGroups = (groups, datatype) => {
    // get all input tag elements & see if they're checked, if yes add to array
    let group = groups[0].getElementsByTagName("input");
    let checkedArr = [];
    for (let i = 0; i < group.length; i++) {
        if (group[i].checked) {
            checkedArr.push(datatype + "_" + group[i].value);
        }
    }
    return checkedArr;
}

// handle transformations
handleTransformations = (transformations, datatype) => {
    let trans = transformations[0].getElementsByClassName("control-group transformation");
    let apply = [];
    for (let i = 0; i < trans.length; i++) {
        // get the textArea input
        let tInput = trans[i].getElementsByClassName("control term")[0];
        tInput = tInput.getElementsByTagName("input")[0].value;

        // get selected one of COUNT, AVG, etc
        let selectedT = trans[i].getElementsByClassName("control operators")[0];
        selectedT = selectedT.getElementsByTagName("select")[0];
        selectedT = selectedT.options[selectedT.selectedIndex].text;

        // get selected one of columns
        let tField = trans[i].getElementsByClassName("control fields")[0];
        tField = tField.getElementsByTagName("select")[0];
        tField = tField.value;

        let obj = {};
        obj[selectedT] = datatype + "_" + tField;
        let innerObj = {};
        innerObj[tInput] = obj;
        apply.push(innerObj);
    }
    return apply;
}


CampusExplorer.buildQuery = () => {
    let query = {};
    // TODO: implement!
    // want to declare local variables that contain each of the following obtained via id/class

    // -> What data type are we working with
    let dataType = document.getElementsByClassName("tab-panel active")[0].dataset.type;

    // grab active form container for conditions/columns/order/groups/transformations
    let formContainerActive = document.getElementsByClassName("tab-panel active")[0];

    // obtain relevant information for building the query
    let conditions = formContainerActive.getElementsByClassName("form-group conditions");
    conditions = handleConditions(conditions, dataType);

    let columns = formContainerActive.getElementsByClassName("form-group columns");
    columns = handleColumns(columns, dataType);

    let order = formContainerActive.getElementsByClassName("form-group order");
    order = handleOrder(order[0].children[1], dataType);

    let groups = formContainerActive.getElementsByClassName("form-group groups");
    groups = handleGroups(groups, dataType);

    let transformations = formContainerActive.getElementsByClassName("form-group transformations");
    transformations = handleTransformations(transformations, dataType);

    query["WHERE"] = conditions;
    query["OPTIONS"] = {};
    query["OPTIONS"]["COLUMNS"] = columns;
    if (order["keys"].length != 0) {
        query["OPTIONS"]["ORDER"] = order;
    }
    /* if (order != null) {
        query["OPTIONS"]["ORDER"] = order;
    }*/
    if (groups.length != 0 || transformations.length != 0) {
        query["TRANSFORMATIONS"] = {};
        if (groups.length != 0) {
            query["TRANSFORMATIONS"]["GROUP"] = groups;
        }
        if (transformations.length != 0) {
            query["TRANSFORMATIONS"]["APPLY"] = transformations;
        }
    }

    return query;
}
