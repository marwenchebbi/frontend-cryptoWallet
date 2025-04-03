import * as Yup from 'yup';

// Validation schema for transfer form
export const transferSchema = Yup.object().shape({
  amount: Yup.string()
    .required('Amount is required')
    .matches(/^[0-9]+(\.[0-9]+)?$/, 'Amount must be a valid number')
    .test('positive', 'Amount must be greater than 0', (value) => parseFloat(value || '0') > 0),
  receiverAddress: Yup.string()
    .required('Recipient address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid recipient address format'),
});