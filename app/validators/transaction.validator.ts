import * as Yup from 'yup';

export const transferSchema = Yup.object().shape({
  amount: Yup.string()
    .required('Amount is required')
    .matches(/^[0-9]+(\.[0-9]+)?$/, 'Amount must be a valid number')
    .test('positive', 'Amount must be greater than 0', (value) => parseFloat(value || '0') > 0),
  receiverAddress: Yup.string()
    .optional()
    .matches(/^0x[a-fA-F0-9]{40}$/, {
      message: 'Invalid recipient address format',
      excludeEmptyString: true,
    }),
  senderAddress: Yup.string().required('Sender address is required'),
  inputCurrency: Yup.string()
    .required('Input currency is required')
    .oneOf(['USDT', 'PRX'], 'Input currency must be either USDT or PRX'),
});