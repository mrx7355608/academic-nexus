import validateEditFileData from "./edit.validator";
import validateCreateFileData from "./create.validator";

const validators = {
    editValidator: validateEditFileData(),
    createValidator: validateCreateFileData()
}

export default validators;
