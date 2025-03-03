import { http } from "@/utils/request/request"
import axios, { AxiosResponse } from "axios"

export function getData():Promise<AxiosResponse> {
  return axios.get('https://jsonplaceholder.typicode.com/todos/1')
}