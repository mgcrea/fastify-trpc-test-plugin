export type PrimitiveJSONValue = string | number | boolean | undefined | null;
export type JSONValue = PrimitiveJSONValue | JSONArray | JSONObject;
export interface JSONArray extends Array<JSONValue> {}
export interface JSONObject {
  [key: string]: JSONValue;
}
