import ReactForm from "~/ReactForm";
import { FormObject } from "~/types/ReactForm";
import { TemplateRegistry } from "~/types/templates";

import { FormValidationMethod, ValidationMethods, ValidationResult, ValidationWrappers, ValidatorWrapper } from "~/types/validators";

type ValidationLoaders = {
    [K in Exclude<FormValidationMethod, "infer">]: () => Promise<ValidationWrappers<any>>;
}

export const validatorLoaders: ValidationLoaders = {
    "function": async() =>
        await import("./methods/function") as unknown as ValidationWrappers<any>,
    "ajv": async() =>
        await import("./methods/function") as unknown as ValidationWrappers<any>,
    "joi": async() =>
        await import("./methods/function") as unknown as ValidationWrappers<any>,
    "yup": async() =>
        await import("./methods/yup") as unknown as ValidationWrappers<any>,
};

export const validateForm = async<
    D extends FormObject,
    V extends FormValidationMethod,
    T extends TemplateRegistry
>(form: ReactForm<D, V, T>, options?: any) => {
    const validator = form.validation;
    const method = form.validationMethod;
    const values = form.values();

    if(!validator || !method) {
        // What to do when it isn't defined? For now, assume it's valid!
        return { skipped: true, value: values, errors: {} } as ValidationResult<D>;
    }

    if(method === "infer") {
        return { skipped: true, value: values, errors: {} } as ValidationResult<D>;
        // throw new Error("Inferred validators are work in progress!");
    }

    let wrapper = await validatorLoaders[method as string]() as ValidatorWrapper<D, V, T>;
    return await wrapper.validate(form, values, options) as ValidationResult<D>;

    // @ts-ignore Validate function exists for Yup/Joi validator schemas
    // if(validator.validate) {
    //     try {
    //         const schema = validator as YupJoiValidator<T>;
    //         let value = await schema.validate(values, mergeJoiOptions(options));

    //         if(value.error) {

    //         }
    //     } catch(ex) {

    //     }
    // }

    // if(typeof validator === "function") {
    //     let errors = {};
    //     const res = await validator(values, errors);

    //     if(validator.schema) {

    //     }
    // }
}
