import express from "express";
import { counsellor_verifyJWT, user_verifyJWT } from "../middleware/auth.middleware.js";
import {
  requestSession,
  endSession,
  registerCounsellor,
  loginCounsellor,
  acceptSession,
  logoutCounsellor,
  getActiveSessions,
  getCounselorStats,
  addNotesToSession,
  sendEmailCode,
  addCounsellorReview,
  getCounsellorDashboardStats,
  getCounselorProfile,
  updateProfile,
  checkSittingSeries,
  rejoinSession,
  getClients,
  getAvailableSlots,
  scheduleAppointment,
  getAppointments,
  getTodaysAppointments,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  // Notifications controllers
  getCounsellorNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  acceptNotificationRequest,
  rejectNotificationRequest
} from "../controllers/counsellor.controller.js";
import { sendOTP } from "../controllers/parent.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

// Public routes
router.post("/register-counsellor", upload.array('certifications', 5), registerCounsellor);
router.post("/send-otp", sendOTP);
router.post("/login-counsellor", loginCounsellor);
router.post('/send-email-code', sendEmailCode);

// Protected routes
router.post('/addNotes', counsellor_verifyJWT, addNotesToSession);
router.post("/request", user_verifyJWT, requestSession);
router.post("/accept", counsellor_verifyJWT, acceptSession);
router.post("/end", counsellor_verifyJWT, endSession);
router.get("/sessions", counsellor_verifyJWT, getActiveSessions);
router.get('/stats', counsellor_verifyJWT, getCounselorStats);
router.get('/feedback', counsellor_verifyJWT, getCounselorStats);
router.post("/logout-counsellor", counsellor_verifyJWT, logoutCounsellor);
router.post('/review', counsellor_verifyJWT, addCounsellorReview);
router.get('/dashboard-stats', counsellor_verifyJWT, getCounsellorDashboardStats);
router.get("/profile", counsellor_verifyJWT, getCounselorProfile);
router.post("/profile", counsellor_verifyJWT, updateProfile);
router.get('/check-sitting-series', counsellor_verifyJWT, checkSittingSeries);
router.post('/rejoin', counsellor_verifyJWT, rejoinSession);

// ---------------- Notifications Routes ----------------
router.get('/notifications', counsellor_verifyJWT, getCounsellorNotifications); // fetch all notifications
router.patch('/notifications/:id/read', counsellor_verifyJWT, markNotificationAsRead); // mark single read
router.patch('/notifications/read-all', counsellor_verifyJWT, markAllNotificationsAsRead); // mark all read
router.post('/notifications/:id/accept', counsellor_verifyJWT, acceptNotificationRequest); // accept request
router.post('/notifications/:id/reject', counsellor_verifyJWT, rejectNotificationRequest); // reject request

// Routes for counsellor client management and appointments
router.get('/clients', counsellor_verifyJWT, getClients);
router.get('/available-slots/:clientId', counsellor_verifyJWT, getAvailableSlots);
router.post('/schedule-appointment', counsellor_verifyJWT, scheduleAppointment);
router.get('/appointments', counsellor_verifyJWT, getAppointments);
router.get('/appointments/today', counsellor_verifyJWT, getTodaysAppointments);
router.patch('/appointments/:appointmentId/counselor-joined', counsellor_verifyJWT, updateAppointmentStatus);
router.patch('/appointments/:appointmentId', counsellor_verifyJWT, updateAppointmentStatus);
router.put('/appointments/:appointmentId', counsellor_verifyJWT, updateAppointment);
router.delete('/appointments/:appointmentId', counsellor_verifyJWT, deleteAppointment);

export default router;
