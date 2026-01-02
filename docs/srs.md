## 1 System Objective

The objective of the system is to optimize the internal management of an upholstery cleaning business by facilitating:

- Appointment management  
- Assignment of jobs to employees  
- Tracking the status of each service  
- Monthly business accounting control  

---

## 2 System Actors

Two main actors are identified.

### 2.1 Administrator

Person responsible for:

- Managing the schedule  
- Communicating with customers  
- Assigning appointments to workers  
- Controlling payments and accounting  

### 2.2 Worker

Person responsible for:

- Performing cleaning services  
- Accessing and managing assigned appointments  
- Reporting the status of services  

> In this first delivery, the customer is not modeled as a direct system actor.

---

## 3 Functional Requirements

### 3.1 Administrator Functional Requirements

#### RF-A01  
The system shall allow the administrator to view available time slots to offer appointments to customers.

#### RF-A02  
The system shall allow the administrator to register an appointment, including at least:

- Date and time  
- Amount to be charged to the customer  
- Description of the items to be cleaned  
- Estimated service duration  
- Customer contact information  

#### RF-A03  
The system shall allow the administrator to assign an appointment to a worker.

#### RF-A04  
The system shall allow the administrator to reassign an appointment to another worker.

#### RF-A05  
The system shall allow marking an appointment as completed.

#### RF-A06  
The system shall allow indicating whether an appointment has been paid by the customer.

#### RF-A07  
The system shall allow recording whether the payment corresponding to the worker has been completed or if there is an outstanding debt.

#### RF-A08  
The system shall allow configuring the percentage of earnings that each worker receives per appointment, allowing this percentage to change over time.

#### RF-A09  
The system shall allow access to monthly accounting summaries.

#### RF-A10  
The system shall allow access to an accounting summary of the current month up to the present date.

#### RF-A11  
The system shall allow registering a follow-up service associated with a previously completed appointment.

#### RF-A12  
The system shall ensure that follow-up services do not generate additional charges to the customer.

#### RF-A13  
The system shall allow maintaining information about the worker who performed the original service and the customer who requested the follow-up service.

#### RF-A14  
The system shall allow storing customer information for potential future contact for marketing purposes.

#### RF-A15  
The system shall allow the administrator to view the current status of each worker’s appointments in order to estimate which appointment is being performed in real time.

---

### 3.2 Worker Functional Requirements

#### RF-T01  
The system shall allow the worker to access the list of assigned appointments.

#### RF-T02  
The system shall allow the worker to define their available working hours.

#### RF-T03  
The system shall allow the worker to access all information associated with each assigned appointment.

#### RF-T04  
The system shall allow the worker to send an assigned appointment to another worker.

#### RF-T05  
The system shall allow the worker to accept or reject an appointment sent by another worker.

#### RF-T06  
The system shall allow the worker to mark an appointment as completed.

#### RF-T07  
The system shall allow the worker to indicate that an appointment has been successfully paid.

---

## 4 Accounting Functional Requirements

These requirements apply to the entire system.

#### RF-C01  
The system shall allow recording who currently holds the money corresponding to each appointment.

#### RF-C02  
The system shall allow determining whether the worker owes money to the business or the business owes money to the worker.

#### RF-C03  
The system shall allow reflecting this information in the accounting summaries.

---

## 5 Non-Functional Requirements

#### RNF01  
The application shall run on Android devices.

#### RNF02  
The user interface shall be clear and allow quick reading of appointment information.

#### RNF03  
The system shall persist information related to appointments, workers, and customers.

#### RNF04  
Access to system functionalities shall depend on the user role (administrator or worker).

---

## 6 Scope of the First Delivery

### 6.1 Included

- Basic appointment management  
- Appointment assignment and reassignment  
- Viewing appointments by worker  
- Recording appointment status (completed / paid)  
- Basic customer records  
- Simple monthly accounting summary  

### 6.2 Not Included

- Payment automation  
- Automatic notifications  
- Customer access to the system  
- Advanced marketing functionalities  
