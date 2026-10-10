import http from 'node:http';
import app from './index.js';

const PORT = 5001; // Use port 5001 for test suite to avoid conflicts
const server = http.createServer(app);

async function runTests() {
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running on port ${PORT}...`);

  const baseUrl = `http://localhost:${PORT}/api`;

  async function apiCall(path, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch (e) {
      json = text;
    }
    return { status: res.status, data: json };
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ ${testName}`);
      failed++;
    }
  }

  try {
    console.log('\n--- 1. Health Check ---');
    const health = await apiCall('/health');
    assert(health.status === 200 && health.data.status === 'ok', 'GET /health returns ok');

    console.log('\n--- 2. Auth Tests ---');
    const teacherLogin = await apiCall('/auth/login', 'POST', {
      email: 'teacher@cbit.edu.in',
      password: 'password123',
    });
    assert(teacherLogin.status === 200 && teacherLogin.data.token, 'Teacher login successful');
    const teacherToken = teacherLogin.data.token;

    const studentLogin = await apiCall('/auth/login', 'POST', {
      email: 'student@cbit.edu.in',
      password: 'password123',
    });
    assert(studentLogin.status === 200 && studentLogin.data.user.role === 'student', 'Student login successful');
    const studentToken = studentLogin.data.token;

    const testEmail = `test_${Date.now()}@cbit.edu.in`;
    const register = await apiCall('/auth/register', 'POST', {
      email: testEmail,
      password: 'password123',
      name: 'Test Student',
      role: 'student',
      rollNumber: '242P1A0599',
    });
    assert(register.status === 201 && register.data.token, 'New student registration successful');

    const me = await apiCall('/auth/me', 'GET', null, teacherToken);
    assert(me.status === 200 && me.data.user.role === 'teacher', 'GET /auth/me returns teacher');

    console.log('\n--- 3. Students CRUD Tests ---');
    const studentsList = await apiCall('/students');
    assert(studentsList.status === 200 && Array.isArray(studentsList.data) && studentsList.data.length >= 60, 'GET /students returns list of students');

    const newStudentRoll = `242P1A0588`;
    const addStudent = await apiCall('/students', 'POST', {
      roll_number: newStudentRoll,
      name: 'Integration Test Student',
      phone: '+91 99999 88888',
      department: 'Computer Science',
    });
    assert(addStudent.status === 201 && addStudent.data.roll_number === newStudentRoll, 'POST /students adds new student');
    const createdStudentId = addStudent.data.id;

    const updateStudent = await apiCall(`/students/${createdStudentId}`, 'PUT', {
      name: 'Updated Test Student',
      phone: '+91 99999 77777',
    });
    assert(updateStudent.status === 200 && updateStudent.data.name === 'Updated Test Student', 'PUT /students/:id updates student');

    const deleteStudent = await apiCall(`/students/${createdStudentId}`, 'DELETE');
    assert(deleteStudent.status === 200 && deleteStudent.data.success, 'DELETE /students/:id removes student');

    console.log('\n--- 4. Attendance Tests ---');
    const allAttendance = await apiCall('/attendance');
    assert(allAttendance.status === 200 && Array.isArray(allAttendance.data), 'GET /attendance returns records');

    const markAtt = await apiCall('/attendance', 'POST', {
      student_id: '242P1A0501',
      date: '2026-10-10',
      status: 'present',
      subject: 'Data Structures',
      marked_by: 'teacher@cbit.edu.in',
    });
    assert(markAtt.status === 201, 'POST /attendance marks student present');

    const bulkMark = await apiCall('/attendance/bulk', 'POST', [
      { student_id: '242P1A0501', date: '2026-10-11', status: 'present', subject: 'DBMS' },
      { student_id: '242P1A0502', date: '2026-10-11', status: 'late', subject: 'DBMS' },
    ]);
    assert(bulkMark.status === 200 && bulkMark.data.count === 2, 'POST /attendance/bulk marks multiple students');

    const studentAtt = await apiCall('/attendance/student/242P1A0501');
    assert(studentAtt.status === 200 && studentAtt.data.length > 0, 'GET /attendance/student/:roll returns student attendance');

    console.log('\n--- 5. Timetable Tests ---');
    const timetable = await apiCall('/timetable');
    assert(timetable.status === 200 && timetable.data.length >= 30, 'GET /timetable returns weekly timetable');

    const updateSlot = await apiCall('/timetable', 'PUT', {
      day: 'Monday',
      time: '09:00 - 10:00',
      subject: 'Advanced Algorithms',
      teacher: 'Dr. Narashima',
      room: 'CS-101',
    });
    assert(updateSlot.status === 200 && updateSlot.data.subject === 'Advanced Algorithms', 'PUT /timetable updates slot');

    console.log('\n--- 6. Messages Tests ---');
    const messages = await apiCall('/messages', 'GET', null, teacherToken);
    assert(messages.status === 200 && Array.isArray(messages.data), 'GET /messages returns messages');

    const sendMsg = await apiCall('/messages', 'POST', {
      sender_id: 'teacher@cbit.edu.in',
      recipient_id: '242P1A0501',
      subject: 'Lab Assignment 3 Review',
      content: 'Your code review comments have been uploaded.',
    });
    assert(sendMsg.status === 201 && sendMsg.data.id, 'POST /messages sends new message');

    const msgId = sendMsg.data.id;
    const readMsg = await apiCall(`/messages/${msgId}/read`, 'PUT');
    assert(readMsg.status === 200 && readMsg.data.read === true, 'PUT /messages/:id/read marks message as read');

    console.log(`\n========================================`);
    console.log(`  Tests Passed: ${passed}`);
    console.log(`  Tests Failed: ${failed}`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Test execution failed with error:', err);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
