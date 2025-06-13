import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  UsersIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  CubeIcon,
  BanknotesIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { SIDEBAR_WIDTH } from '@/lib/constants'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'CRM', href: '/crm', icon: UsersIcon },
  { name: 'Sales', href: '/sales', icon: ShoppingCartIcon },
  { name: 'Invoicing', href: '/invoicing', icon: DocumentTextIcon },
  { name: 'Inventory', href: '/inventory', icon: CubeIcon },
  { name: 'Accounting', href: '/accounting', icon: BanknotesIcon },
  { name: 'HRM', href: '/hrm', icon: UserGroupIcon },
  { name: 'Workflow', href: '/workflow', icon: Cog6ToothIcon },
]

export function Sidebar({ open, setOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-40 md:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <span className="text-xl font-bold text-primary-600">NextCore ERP</span>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          isActive
                            ? 'bg-primary-100 text-primary-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <item.icon
                        className="mr-4 flex-shrink-0 h-6 w-6 text-primary-500"
                        aria-hidden="true"
                      />
                      {item.name}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink to fit close icon */}</div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 ${
          open ? 'md:w-[280px]' : 'md:w-20'
        } transition-all duration-300`}
        style={{ width: open ? SIDEBAR_WIDTH : 80 }}
      >
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              {open ? (
                <span className="text-xl font-bold text-primary-600">NextCore ERP</span>
              ) : (
                <span className="text-xl font-bold text-primary-600">NC</span>
              )}
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon
                    className="flex-shrink-0 h-6 w-6 text-primary-500"
                    aria-hidden="true"
                  />
                  {open && <span className="ml-3">{item.name}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}