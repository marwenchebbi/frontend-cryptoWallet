import { AnySchema, ValidationError } from "yup";

type ValidationResult = { errors : { [key : string] : string }, success : boolean }

 export const validateForm = async (data : object, schema : AnySchema): Promise<ValidationResult> => {
    try {
      await schema.validate(data, { abortEarly: false });
      return { errors : {}, success : true }
    } catch (validationError) {
        const errorMessages : ValidationResult['errors'] = {};
      if (validationError instanceof ValidationError) {
        validationError.inner.forEach((err) => {
          if (err.path) {
            errorMessages[err.path as string] = err.message;
          }
        });
      }
      return  { errors : errorMessages, success : false };
    }
  };