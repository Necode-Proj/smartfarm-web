import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCarrot, faPepperHot, faLeaf, faSeedling } from '@fortawesome/free-solid-svg-icons'

export const VEGGIE_FA_ICONS = {
  wortel: { icon: faCarrot, color: 'text-orange-500', bg: 'bg-orange-100' },
  tomat:  { icon: faPepperHot, color: 'text-red-500', bg: 'bg-red-100' },
  bayam:  { icon: faLeaf, color: 'text-green-500', bg: 'bg-green-100' },
}

export default function VeggieIcon({ vegetable, className = 'w-6 h-6', size = 'lg' }) {
  const item = VEGGIE_FA_ICONS[vegetable?.toLowerCase()] || { icon: faSeedling, color: 'text-primary-600', bg: 'bg-primary-100' }
  
  return (
    <div className={`inline-flex items-center justify-center rounded-xl p-2.5 ${item.bg} ${item.color}`}>
      <FontAwesomeIcon icon={item.icon} className={className} size={size} />
    </div>
  )
}
