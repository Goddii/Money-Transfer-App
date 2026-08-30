// Service payment contract helpers.
//
// The backend enum (app/models/service_payment.py ServiceType) is UPPERCASE and
// POST /api/service-payments requires that exact value in its `service_type`
// field. GET /api/services exposes the same value as `service_type`, with `type`
// kept as a legacy alias, so both keys are read here: a provider object coming
// from the API must never resolve to an empty service type (that produced a 400
// "Invalid service type" on submit).

export const SERVICE_TYPES = ['ELECTRICITY', 'WATER', 'AIRTIME']

export function serviceTypeOf(service) {
  return service?.service_type || service?.type || ''
}

export function isValidServiceType(serviceType) {
  return SERVICE_TYPES.includes(serviceType)
}
