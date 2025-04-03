import { useMutation } from "@tanstack/react-query";

const getPrice = async (): Promise<boolean> => {
  const url = 'http://192.168.11.38:3000/transaction/price' 
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (res.status === 200 || res.status === 201) {
    return true;
  } else if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.errorDetails?.message || 'Transfer failed');
  }
  return false;
};


export const useGetPrice = () =>{
    return useMutation({
        mutationFn : getPrice
    })

}