/**
 * Example usage of Stripe customer listing functionality
 * This demonstrates how to use the Stripe integration in your SoloSuccess AI project
 */

import { listStripeCustomers, getStripeCustomersPaginated, isStripeConfigured } from '@/lib/stripe'

// Example 1: Simple customer listing (as requested)
async function listCustomers() {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      console.log('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
      return []
    }

    // List customers (equivalent to your requested code)
    const customers = await listStripeCustomers()
    console.log('Customers:', customers)
    
    return customers
  } catch (error) {
    console.error('Error listing customers:', error)
    return []
  }
}

// Example 2: Paginated customer listing
async function listCustomersWithPagination() {
  try {
    const result = await getStripeCustomersPaginated(10) // Get 10 customers per page
    
    console.log(`Found ${result.customers.length} customers`)
    console.log(`Has more: ${result.hasMore}`)
    
    // Process customers
    result.customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.email || 'No email'} (ID: ${customer.id})`)
    })
    
    // If there are more customers, you can get the next page
    if (result.hasMore && result.nextStartingAfter) {
      const nextPage = await getStripeCustomersPaginated(10, result.nextStartingAfter)
      console.log(`Next page: ${nextPage.customers.length} customers`)
    }
    
  } catch (error) {
    console.error('Error listing customers with pagination:', error)
  }
}

// Example 3: Using in an API route or server component
export async function getCustomersForDashboard() {
  try {
    // Get first 20 customers for dashboard display
    const customers = await listStripeCustomers(20)
    
    return {
      success: true,
      customers: customers.map(customer => ({
        id: customer.id,
        email: customer.email,
        name: customer.name,
        created: customer.created,
        subscriptionCount: customer.subscriptions?.data?.length || 0
      })),
      total: customers.length
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      customers: [],
      total: 0
    }
  }
}

// Export the main function for easy usage
export { listCustomers, listCustomersWithPagination }
