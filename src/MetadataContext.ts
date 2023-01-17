import { createNestingContext } from "./utils/contexts";
import { mergeProperties } from "./utils/properties";
import type ReactForm from "./ReactForm";

export type MetadataContextInfo = {
    form: ReactForm;
    objectProp: string | null;
};

/**
 *? MetadataContext allows groups of fields to have unique logic or abilities
 *? For example, editing fields of an object works like so:
 *
 * <FormObject field="PetInformation">
 *      <Field.Name component={Input} type="text" placeholder="Name" label="Name" />
 * </FormObject>
 *
 * The above example text input is editing the Name property of the PetInformation object in the form.
 * In the above example, the actual dotpath being used would be "PetInformation.Name"
 */
const MetadataContext = createNestingContext<MetadataContextInfo>({
    form: null as unknown as ReactForm,
    objectProp: null
}, undefined, (src, dest) => ({
    // Take the deepest form when possible in case of nesting
    form: dest.form || src.form,
    // Nesting <FormObject /> will properly get into sub-props
    objectProp: mergeProperties(src.objectProp, dest.objectProp)
}));

MetadataContext.displayName = "FormMetadataContext";

export default MetadataContext;