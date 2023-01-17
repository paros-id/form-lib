import { UNDEFINED } from "~/symbols";
import get from "./underscore/get";

export const mergeProperties = (...props) =>
    props.filter(x => x && x.length).join(".");

export const getPropValue = (obj, prop) => get(obj, prop, UNDEFINED);

export const propertyExists = (obj, prop) => getPropValue(obj, prop) !== UNDEFINED;

export const determineValueGetter = (valueGetter) => {
    if(typeof valueGetter === "function") {
        return valueGetter;
    } else if(typeof valueGetter === "string") {
        return e => get(e, valueGetter);
    } else {
        return e => get(e, "target.value", "");
    }
};