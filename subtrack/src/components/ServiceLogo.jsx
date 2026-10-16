import { getServiceLogo } from '../lib/serviceLogos'

export default function ServiceLogo({ service }) {
  const logo = getServiceLogo(service)
  return logo ? (
    <img
      src={logo.src}
      alt=""
      data-service-logo={logo.key}
      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#fff', borderRadius: 'inherit', padding: 2, boxSizing: 'border-box' }}
    />
  ) : (
    <span>{service.abbr || service.name?.slice(0, 2).toUpperCase() || '?'}</span>
  )
}
