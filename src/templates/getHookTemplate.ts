// import { MetadataContextInfo } from "~/MetadataContext";

// import { determineValueGetter, mergeProperties } from "~/utils/properties";
// import omit from "~/utils/underscore/omit";

// import { FieldTemplate, HookTemplate } from "~/types/hooking";

// export function getHookTemplate(
//     field: string,
//     context: MetadataContextInfo = {} as MetadataContextInfo,
//     fieldProps: any,
//     fieldRef?: any
// ) {
//     const { objectProp } = context;

//     let {
//         component: Component,
//         valueGetter = "target.value",
//         valueProp = "value",
//         errorProp = "error",
//         onChangeProp = "onChange",
//         onBlurProp = "onBlur",
//         onChange, onBlur,
//         defaultValue,
//         componentProps = {},
//         template,
//         forwardedRef = fieldRef,
//         validateOnBlur,
//         interceptOnChange = false,
//         fieldHiddenWhenDisabled = false,
//         ...props
//     } = fieldProps;

//     let _template: FieldTemplate = {
//         name: field,
//         defaultValue,
//         valueGetter: determineValueGetter(valueGetter),
//         valueProp, errorProp, onChangeProp, onBlurProp,
//         onChange, onBlur,
//         validateOnBlur,
//         target: mergeProperties(objectProp, field),
//         props: componentProps,
//         hideWhenDisabled: fieldHiddenWhenDisabled,
//         interceptOnChange
//     };

//     let res: HookTemplate = {
//         Component, ref: forwardedRef,
//         props: omit(props, "name"),
//         template: _template
//     };

//     let transformer = typeof template === "string" && getTemplate(template);

//     if(transformer) {
//         transformer({
//             field: field,
//             output: res,
//             template: _template,
//             templateProps: _template.props,
//             context: context,
//             props: fieldProps
//         });
//     } else if(typeof template === "function") {
//         template({
//             field: field,
//             output: res,
//             template: _template,
//             templateProps: _template.props,
//             context: context,
//             props: fieldProps
//         });
//     }

//     return res;
// }
export {}