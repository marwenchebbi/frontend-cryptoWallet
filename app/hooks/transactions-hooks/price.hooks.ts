import { useQuery } from "@tanstack/react-query";

const getPrice = async (): Promise<number> => {
  const url = 'http://192.168.11.38:3000/transaction/price' 
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (res.status === 200 || res.status === 201) {
    return res.json();
  } else if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.errorDetails?.message || 'Transfer failed');
  }
  return res.json();
};


export const useGetPrice = () =>{
    return useQuery({
        queryKey : ['getPrice' ] ,
        queryFn : ()=> getPrice(),
        refetchOnWindowFocus: true,

    })

}