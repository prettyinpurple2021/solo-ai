export const PRICE_IDS = {
  accelerator: {
    monthly: process.env.STRIPE_ACCELERATOR_PRICE_ID || '',
    yearly: process.env.STRIPE_ACCELERATOR_YEARLY_PRICE_ID || ''
  },
  dominator: {
    monthly: process.env.STRIPE_DOMINATOR_PRICE_ID || '',
    yearly: process.env.STRIPE_DOMINATOR_YEARLY_PRICE_ID || ''
  }
};

export const SUBSCRIPTION_TIERS = {
  LAUNCH: {
    id: 'launch',
    price: 0,
    stripePriceId: '',
    stripeYearlyPriceId: '',
    limits: {
      dailyConversations: 5,
      aiAgents: 1,
      fileStorage: '100MB'
    }
  },
  ACCELERATOR: {
    id: 'accelerator',
    price: 19,
    stripePriceId: PRICE_IDS.accelerator.monthly,
    stripeYearlyPriceId: PRICE_IDS.accelerator.yearly,
    limits: {
      dailyConversations: 50,
      aiAgents: 5,
      fileStorage: '10GB'
    }
  },
  DOMINATOR: {
    id: 'dominator',
    price: 29,
    stripePriceId: PRICE_IDS.dominator.monthly,
    stripeYearlyPriceId: PRICE_IDS.dominator.yearly,
    limits: {
      dailyConversations: -1,
      aiAgents: 10,
      fileStorage: '100GB'
    }
  }
};
