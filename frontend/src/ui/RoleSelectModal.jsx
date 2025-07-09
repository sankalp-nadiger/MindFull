import { useState } from 'react'
import { User, UserCheck, Users } from 'lucide-react'

export default function RoleSelectionModal(props) {
  const [open, setOpen] = useState(false)

  const handleRoleSelect = (role) => {
    console.log(`Selected role: ${role}`)
    // Here you would handle routing to different pages
    // For example: router.push(`/${role}`) or window.location.href = `/${role}`
    setOpen(false)
  }

  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'Access student portal and resources',
      icon: User,
      color: 'bg-blue-100 text-blue-600 hover:bg-blue-200'
    },
    {
      id: 'counsellor',
      title: 'Counsellor',
      description: 'Manage student guidance and support',
      icon: UserCheck,
      color: 'bg-green-100 text-green-600 hover:bg-green-200'
    },
    {
      id: 'parent',
      title: 'Parent',
      description: 'Monitor child progress and activities',
      icon: Users,
      color: 'bg-purple-100 text-purple-600 hover:bg-purple-200'
    }
  ]

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
      >
        {props.btn}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-500/75 transition-opacity"
            onClick={() => setOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Choose Your Role
              </h3>
              <p className="text-sm text-gray-500">
                Select your role to access the appropriate dashboard
              </p>
            </div>

            <div className="space-y-3">
              {roles.map((role) => {
                const IconComponent = role.icon
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group hover:shadow-md"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${role.color} transition-colors duration-200`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-gray-700">
                          {role.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}