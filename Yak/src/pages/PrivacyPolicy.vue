<template>
  <div class="legal-page">
    <h1>Privacy Policy</h1>
    <p class="effective-date">Effective Date: April 9, 2026</p>

    <p>
      This Privacy Policy describes how Yet Another Acronym Game ("YAAG", "the Game"), operated by
      the YAAG Team ("we", "us", "our"), collects, uses, and handles your information when you use
      the Game as a Discord Activity.
    </p>

    <h2>1. Information We Collect</h2>

    <h3>Information from Discord</h3>
    <p>
      When you launch YAAG, we receive the following information through Discord's OAuth system:
    </p>
    <ul>
      <li>Your Discord user ID</li>
      <li>Your display name and guild nickname</li>
      <li>Your avatar and avatar decoration URLs</li>
    </ul>
    <p>We do not request or receive your email address, password, friend list, or messages.</p>

    <h3>Gameplay Data</h3>
    <p>During a game session, we process:</p>
    <ul>
      <li>Acronym submissions you create</li>
      <li>Votes you cast</li>
      <li>Your submission timing (used for tiebreaking)</li>
    </ul>

    <h3>Purchase Data</h3>
    <p>
      If you make in-app purchases, all payment processing is handled by Discord. We do not collect,
      store, or have access to your payment information (credit card numbers, billing addresses,
      etc.). We receive only entitlement data from Discord indicating which items you have
      purchased, so we can grant you access to those items in-game.
    </p>

    <h2>2. How We Use Your Information</h2>
    <p>We use the information described above to:</p>
    <ul>
      <li>Display your name and avatar to other players during game sessions</li>
      <li>Track scores and votes within a game session</li>
      <li>Deliver purchased cosmetic items to your account</li>
    </ul>
    <p>
      We do not use your information for advertising, profiling, or any purpose unrelated to
      operating the Game.
    </p>

    <h2>3. Data Storage and Retention</h2>
    <p>
      YAAG is designed to minimize data retention. Game session data (submissions, votes, scores) is
      held in memory and in Redis during active gameplay and is deleted when the game session ends.
      We do not maintain long-term databases of gameplay history or user activity.
    </p>
    <p>
      Purchase entitlements are managed by Discord and queried on demand. We do not independently
      store purchase records.
    </p>

    <h2>4. Data Sharing</h2>
    <p>
      We do not sell, rent, or share your personal information with third parties. Your information
      is visible to other players in your game session only to the extent necessary for gameplay
      (display name, avatar, submissions, and scores).
    </p>
    <p>
      YAAG operates within Discord's infrastructure. Your use of Discord is governed by
      <a href="https://discord.com/privacy" target="_blank" rel="noopener"
        >Discord's Privacy Policy</a
      >.
    </p>

    <h2>5. Children's Privacy</h2>
    <p>
      YAAG does not knowingly collect information from children under the age of 13 (or the
      applicable minimum age in your jurisdiction). Access to YAAG requires a Discord account, and
      Discord's age requirements apply.
    </p>

    <h2>6. Security</h2>
    <p>
      We take reasonable measures to protect the information processed during gameplay. All
      communication between the Game client and our servers is encrypted via TLS. Authentication is
      handled through Discord's OAuth system, and we do not store authentication tokens beyond the
      duration of a session.
    </p>

    <h2>7. Your Rights</h2>
    <p>
      Since YAAG does not maintain persistent user accounts or long-term data storage, there is
      generally no stored personal data to access, correct, or delete. If you believe we hold any
      information about you and would like to request its deletion, please contact us.
    </p>

    <h2>8. Changes to This Policy</h2>
    <p>
      We may update this Privacy Policy from time to time. If we make material changes, we will
      update the effective date at the top of this page. Your continued use of YAAG after changes
      are posted constitutes acceptance of the revised policy.
    </p>

    <h2>9. Contact</h2>
    <p>
      If you have questions or concerns about this Privacy Policy, contact us at
      <a href="mailto:OtherwiseJunk@gmail.com">OtherwiseJunk@gmail.com</a>.
    </p>
  </div>
</template>

<style scoped>
.legal-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  color: #e0e0e0;
  line-height: 1.7;
}

.legal-page h1 {
  font-size: 2rem;
  margin-bottom: 4px;
}

.legal-page h2 {
  font-size: 1.25rem;
  margin-top: 32px;
  margin-bottom: 8px;
  color: #ffffff;
}

.legal-page h3 {
  font-size: 1.1rem;
  margin-top: 20px;
  margin-bottom: 6px;
  color: #cccccc;
}

.effective-date {
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 24px;
}

.legal-page a {
  color: #7289da;
}

.legal-page ul {
  padding-left: 24px;
}

.legal-page li {
  margin-bottom: 6px;
}
</style>
