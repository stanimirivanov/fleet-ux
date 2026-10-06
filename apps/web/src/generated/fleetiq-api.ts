import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import type { SchemaError } from "effect/Schema"
import * as Schema from "effect/Schema"
import type * as HttpClient from "effect/http/HttpClient"
import * as HttpClientError from "effect/http/HttpClientError"
import * as HttpClientRequest from "effect/http/HttpClientRequest"
import * as HttpClientResponse from "effect/http/HttpClientResponse"
// non-recursive definitions
export type ApiDescription = { readonly "service": "FleetIQ", readonly "version": "v1" } & { readonly [x: string]: Schema.Json }
export const ApiDescription = Schema.StructWithRest(Schema.Struct({ "service": Schema.Literal("FleetIQ"), "version": Schema.Literal("v1") }), [Schema.Record(Schema.String, Schema.Json.annotate({ "expected": "JSON value" }))]).annotate({ "identifier": "ApiDescription" })
export type AssetTypeRef = { readonly "id": string, readonly "version": number } & { readonly [x: string]: Schema.Json }
export const AssetTypeRef = Schema.StructWithRest(Schema.Struct({ "id": Schema.String.check(Schema.isMinLength(1).annotate({ "expected": "a value with a length of at least 1" })).check(Schema.isMaxCodePoints(128).annotate({ "expected": "a string with at most 128 code points" })), "version": Schema.Number.check(Schema.isInt().annotate({ "expected": "an integer" })).check(Schema.isGreaterThanOrEqualTo(1).annotate({ "expected": "a value greater than or equal to 1" })).check(Schema.isLessThanOrEqualTo(4294967295).annotate({ "expected": "a value less than or equal to 4294967295" })) }), [Schema.Record(Schema.String, Schema.Json.annotate({ "expected": "JSON value" }))]).annotate({ "identifier": "AssetTypeRef" })
export type Problem = { readonly "type": string, readonly "title": string, readonly "status": number } & { readonly [x: string]: Schema.Json }
export const Problem = Schema.StructWithRest(Schema.Struct({ "type": Schema.String, "title": Schema.String, "status": Schema.Number.check(Schema.isInt().annotate({ "expected": "an integer" })).check(Schema.isGreaterThanOrEqualTo(400).annotate({ "expected": "a value greater than or equal to 400" })).check(Schema.isLessThanOrEqualTo(599).annotate({ "expected": "a value less than or equal to 599" })) }), [Schema.Record(Schema.String, Schema.Json.annotate({ "expected": "JSON value" }))]).annotate({ "description": "Minimum application/problem+json shape. Future compatible problems may include optional fields.", "identifier": "Problem" })
export type AssetSummary = { readonly "id": string, readonly "tenant_id": string, readonly "name": string, readonly "asset_type": AssetTypeRef } & { readonly [x: string]: Schema.Json }
export const AssetSummary = Schema.StructWithRest(Schema.Struct({ "id": Schema.String.check(Schema.isMinLength(1).annotate({ "expected": "a value with a length of at least 1" })).check(Schema.isMaxCodePoints(128).annotate({ "expected": "a string with at most 128 code points" })), "tenant_id": Schema.String.check(Schema.isMinLength(1).annotate({ "expected": "a value with a length of at least 1" })).check(Schema.isMaxCodePoints(128).annotate({ "expected": "a string with at most 128 code points" })), "name": Schema.String.check(Schema.isMinLength(1).annotate({ "expected": "a value with a length of at least 1" })), "asset_type": AssetTypeRef }), [Schema.Record(Schema.String, Schema.Json.annotate({ "expected": "JSON value" }))]).annotate({ "identifier": "AssetSummary" })
export type AssetPage = { readonly "assets": ReadonlyArray<AssetSummary>, readonly "next_after": string | null } & { readonly [x: string]: Schema.Json }
export const AssetPage = Schema.StructWithRest(Schema.Struct({ "assets": Schema.Array(AssetSummary).check(Schema.isMaxLength(100).annotate({ "expected": "a value with a length of at most 100" })), "next_after": Schema.Union([Schema.String.check(Schema.isMinLength(1).annotate({ "expected": "a value with a length of at least 1" })).check(Schema.isMaxCodePoints(128).annotate({ "expected": "a string with at most 128 code points" })), Schema.Null]).annotate({ "description": "Exclusive cursor for the next page, or null when no next page exists." }) }), [Schema.Record(Schema.String, Schema.Json.annotate({ "expected": "JSON value" }))]).annotate({ "identifier": "AssetPage" })
// schemas
export type GetApiVersion200 = ApiDescription
export const GetApiVersion200 = ApiDescription
export type ListAssetsParams = { readonly "limit"?: number, readonly "after"?: string }
export const ListAssetsParams = Schema.Struct({ "limit": Schema.optionalKey(Schema.Number.annotate({ "default": 50 }).check(Schema.isInt().annotate({ "expected": "an integer" })).check(Schema.isGreaterThanOrEqualTo(1).annotate({ "expected": "a value greater than or equal to 1" })).check(Schema.isLessThanOrEqualTo(100).annotate({ "expected": "a value less than or equal to 100" }))), "after": Schema.optionalKey(Schema.String.check(Schema.isMinLength(1).annotate({ "expected": "a value with a length of at least 1" })).check(Schema.isMaxCodePoints(128).annotate({ "expected": "a string with at most 128 code points" }))) })
export type ListAssets200 = AssetPage
export const ListAssets200 = AssetPage
export type ListAssets400 = Problem
export const ListAssets400 = Problem
export type ListAssets401 = Problem
export const ListAssets401 = Problem
export type ListAssets403 = Problem
export const ListAssets403 = Problem
export type ListAssets500 = Problem
export const ListAssets500 = Problem

export interface OperationConfig {
  /**
   * Whether or not the response should be included in the value returned from
   * an operation.
   *
   * If set to `true`, a tuple of `[A, HttpClientResponse]` will be returned,
   * where `A` is the success type of the operation.
   *
   * If set to `false`, only the success type of the operation will be returned.
   */
  readonly includeResponse?: boolean | undefined
}

/**
 * A utility type which optionally includes the response in the return result
 * of an operation based upon the value of the `includeResponse` configuration
 * option.
 */
export type WithOptionalResponse<A, Config extends OperationConfig | undefined> = Config extends {
  readonly includeResponse: true
} ? [A, HttpClientResponse.HttpClientResponse]
  : Config extends { readonly includeResponse?: false | undefined } | undefined ? A
  : A | [A, HttpClientResponse.HttpClientResponse]

export const make = (
  httpClient: HttpClient.HttpClient,
  options: {
    readonly transformClient?: ((client: HttpClient.HttpClient) => Effect.Effect<HttpClient.HttpClient>) | undefined
  } = {}
): FleetIqApi => {
  const unexpectedStatus = (response: HttpClientResponse.HttpClientResponse) =>
    Effect.flatMap(
      Effect.orElseSucceed(response.json, () => "Unexpected status code"),
      (description) =>
        Effect.fail(
          new HttpClientError.HttpClientError({
            reason: new HttpClientError.StatusCodeError({
              request: response.request,
              response,
              description: typeof description === "string" ? description : JSON.stringify(description),
            }),
          }),
        ),
    )
  const withResponse = <Config extends OperationConfig>(config: Config | undefined) => (
    f: (response: HttpClientResponse.HttpClientResponse) => Effect.Effect<any, any>,
  ): (request: HttpClientRequest.HttpClientRequest) => Effect.Effect<any, any> => {
    const withOptionalResponse = (
      config?.includeResponse
        ? (response: HttpClientResponse.HttpClientResponse) => Effect.map(f(response), (a) => [a, response])
        : (response: HttpClientResponse.HttpClientResponse) => f(response)
    ) as any
    return options?.transformClient
      ? (request) =>
          Effect.flatMap(
            Effect.flatMap(options.transformClient!(httpClient), (client) => client.execute(request)),
            withOptionalResponse
          )
      : (request) => Effect.flatMap(httpClient.execute(request), withOptionalResponse)
  }
  const __encodePathParam = encodeURIComponent
  const __makePathRequest = (
    method: (url: string) => HttpClientRequest.HttpClientRequest,
    parameters: ReadonlyArray<string>,
    getPath: () => string,
  ) => Effect.suspend(() => {
    const fail = (description: string, cause?: unknown) => Effect.fail(
      new HttpClientError.HttpClientError({
        reason: new HttpClientError.InvalidUrlError({
          request: method(""),
          cause,
          description,
        }),
      }),
    )
    if (parameters.some((value) => value === "" || /^(?:\.|%2e){1,2}$/i.test(value))) {
      return fail("Path parameters must be non-empty and cannot be dot segments")
    }
    let path: string
    try {
      path = getPath()
    } catch (cause) {
      return fail("Failed to encode path parameter", cause)
    }
    if (path.split("/").some((segment) => /^(?:\.|%2e){1,2}$/i.test(segment))) {
      return fail("Request paths cannot contain dot segments")
    }
    return Effect.succeed(method(path))
  })
  const decodeSuccess =
    <Schema extends Schema.Constraint>(schema: Schema) =>
    (response: HttpClientResponse.HttpClientResponse) =>
      HttpClientResponse.schemaBodyJson(schema)(response)
  const decodeError =
    <const Tag extends string, Schema extends Schema.Constraint>(tag: Tag, schema: Schema) =>
    (response: HttpClientResponse.HttpClientResponse) =>
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(schema)(response),
        (cause) => Effect.fail(FleetIqApiError(tag, cause, response)),
      )
  return {
    httpClient,
    "getApiVersion": (options: Parameters<FleetIqApi["getApiVersion"]>[0]) => HttpClientRequest.get("/api/v1").pipe(
      withResponse(options?.config)(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(GetApiVersion200),
      orElse: unexpectedStatus
    }))
    ),
    "listAssets": (tenantId, options: Parameters<FleetIqApi["listAssets"]>[1]) => __makePathRequest(HttpClientRequest.get, [tenantId], () => "/api/v1/tenants/" + __encodePathParam(tenantId) + "/assets").pipe(
    Effect.flatMap((request) => request.pipe(
      HttpClientRequest.setUrlParams({ "limit": options?.params?.["limit"] as any, "after": options?.params?.["after"] as any }),
      withResponse(options?.config)(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(ListAssets200),
      "400": decodeError("ListAssets400", ListAssets400),
      "401": decodeError("ListAssets401", ListAssets401),
      "403": decodeError("ListAssets403", ListAssets403),
      "500": decodeError("ListAssets500", ListAssets500),
      orElse: unexpectedStatus
    }))
    ))
  )
  }
}

export interface FleetIqApi {
  readonly httpClient: HttpClient.HttpClient
  /**
* Discover the active API major version
*/
readonly "getApiVersion": {
    <Config extends OperationConfig | undefined = undefined>(options: { readonly config: Config }): Effect.Effect<WithOptionalResponse<typeof GetApiVersion200.Type, Config>, HttpClientError.HttpClientError | SchemaError>;
    <Config extends OperationConfig | undefined = undefined>(options: { readonly config?: Config | undefined } | undefined): Effect.Effect<WithOptionalResponse<typeof GetApiVersion200.Type, Config | undefined>, HttpClientError.HttpClientError | SchemaError>;
  }
  /**
* The configured bearer identity must have a current metadata.read grant for the selected tenant. The route is absent without complete bearer configuration. A cursor traversal is not a cross-request snapshot.
*/
readonly "listAssets": {
    <Config extends OperationConfig | undefined = undefined>(tenantId: string, options: { readonly params?: typeof ListAssetsParams.Encoded | undefined; readonly config: Config }): Effect.Effect<WithOptionalResponse<typeof ListAssets200.Type, Config>, HttpClientError.HttpClientError | SchemaError | FleetIqApiError<"ListAssets400", typeof ListAssets400.Type> | FleetIqApiError<"ListAssets401", typeof ListAssets401.Type> | FleetIqApiError<"ListAssets403", typeof ListAssets403.Type> | FleetIqApiError<"ListAssets500", typeof ListAssets500.Type>>;
    <Config extends OperationConfig | undefined = undefined>(tenantId: string, options: { readonly params?: typeof ListAssetsParams.Encoded | undefined; readonly config?: Config | undefined } | undefined): Effect.Effect<WithOptionalResponse<typeof ListAssets200.Type, Config | undefined>, HttpClientError.HttpClientError | SchemaError | FleetIqApiError<"ListAssets400", typeof ListAssets400.Type> | FleetIqApiError<"ListAssets401", typeof ListAssets401.Type> | FleetIqApiError<"ListAssets403", typeof ListAssets403.Type> | FleetIqApiError<"ListAssets500", typeof ListAssets500.Type>>;
  }
}

export interface FleetIqApiError<Tag extends string, E> {
  readonly _tag: Tag
  readonly request: HttpClientRequest.HttpClientRequest
  readonly response: HttpClientResponse.HttpClientResponse
  readonly cause: E
}

class FleetIqApiErrorImpl extends Data.Error<{
  _tag: string
  cause: any
  request: HttpClientRequest.HttpClientRequest
  response: HttpClientResponse.HttpClientResponse
}> {}

export const FleetIqApiError = <Tag extends string, E>(
  tag: Tag,
  cause: E,
  response: HttpClientResponse.HttpClientResponse,
): FleetIqApiError<Tag, E> =>
  new FleetIqApiErrorImpl({
    _tag: tag,
    cause,
    response,
    request: response.request,
  }) as any
