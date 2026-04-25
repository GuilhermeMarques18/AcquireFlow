import { ZodError } from "zod";

 interface ValidationErrorIssue{
    message : string;
    path?: (string | number)[];
 }

 interface FormErrors {
  issues?: ValidationErrorIssue[];
  [key: string]: any; 
 }

export const formValidationError = (errors : FormErrors): string  => {
    if(Array.isArray(errors.issues)) {
        return errors.issues.map(i => i.message).join(', ');
    }
    return JSON.stringify(errors);
};

export const formatZodError = (zodError: ZodError): string => {
    return zodError.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
};