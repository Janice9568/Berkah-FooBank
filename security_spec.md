# Security Specification - Pasar Berkat

## Data Invariants
1. **Event Identity:** An event must have a title, date, startTime, location (state/district/taman), and a positive quota.
2. **Registration Integrity:** A registration must link to a valid event. The `rank` must be sequential (handled by client/cloud-function logic, but rules should prevent manual overwrites of others).
3. **Queue Privacy:** Users can see their own registration details and the estimated time. Public can see the remaining quota. Organizers can see the full list.
4. **Temporal Lock:** Events cannot be modified once they are "completed" or "expired".

## The Dirty Dozen (Vulnerability Payloads)

1. **Identity Spoofing (User Profile):**
   ```json
   { "uid": "victim_uid", "name": "Attacker", "role": "organizer" }
   ```
   *Target:* `/users/attacker_uid` (tries to claim someone else's UID or escalate role).

2. **Privilege Escalation (Event Creation):**
   ```json
   { "title": "Fake Charity", "organizerName": "Scammer", "role": "organizer" }
   ```
   *Target:* `/events/new_event` (tries to create event without being an organizer in their profile).

3. **Quota Poisoning:**
   ```json
   { "quota": -1, "title": "Broken Event" }
   ```
   *Target:* `/events/event_id` (sets negative quota to break logic).

4. **Shadow Field Injection:**
   ```json
   { "title": "Good Event", "isVerified": true, "extraData": "malicious_payload" }
   ```
   *Target:* `/events/event_id` (injects unvalidated fields).

5. **Registration Stealing:**
   ```json
   { "eventId": "event_1", "userId": "victim_uid", "name": "Attacker" }
   ```
   *Target:* `/events/event_1/registrations/attacker_reg` (tries to register for a different user's ID).

6. **Rank Manipulation:**
   ```json
   { "rank": 1, "name": "Latecomer" }
   ```
   *Target:* `/events/event_1/registrations/late_reg` (tries to jump the queue by setting rank manually).

7. **PII Harvesting:**
   `GET /events/event_1/registrations` (as non-organizer).
   *Goal:* Leak everyone's Phone and IC.

8. **Event Hijacking:**
   ```json
   { "organizerName": "Attacker", "title": "Changed" }
   ```
   *Target:* `/events/event_1` (tries to edit an event they didn't create).

9. **Terminal State Bypass:**
   ```json
   { "status": "upcoming" }
   ```
   *Target:* `/events/expired_event` (tries to re-open an expired event).

10. **ID Poisoning:**
    `POST /events/very-long-id-1234567890... (1KB)`
    *Goal:* Denial of Wallet through resource exhaustion.

11. **Timestamp Spoofing:**
    ```json
    { "createdAt": "2000-01-01T00:00:00Z" }
    ```
    *Target:* `/events/event_id` (tries to set a past creation date).

12. **Attendance Fraud:**
    ```json
    { "attended": true }
    ```
    *Target:* `/events/event_1/registrations/reg_1` (user tries to mark themselves as attended).

## Test Runner (firestore.rules.test.ts)
(To be implemented after rules are drafted)
