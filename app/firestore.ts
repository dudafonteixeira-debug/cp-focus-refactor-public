"use client";

import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  limit,
  deleteDoc,
} from "firebase/firestore";

import type {
  UserProfile,
  StudyTask,
  StudySession,
  Subject,
  Topic,
  Question,
  UserAnswer,
} from "./types";

// =========================
// PROFILE
// =========================
export async function ensureUserProfile(profile: UserProfile) {
  const ref = doc(db, "users", profile.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) await setDoc(ref, profile);
}

export async function getUserProfile(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, patch: Partial<UserProfile>) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, patch);
}

// =========================
// TASKS
// =========================
export async function addTask(task: Omit<StudyTask, "id">) {
  const ref = await addDoc(collection(db, "tasks"), task);
  return ref.id;
}

export async function listTasks(uid: string) {
  const q = query(collection(db, "tasks"), where("uid", "==", uid), limit(500));
  const snap = await getDocs(q);

  const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as StudyTask) }));
  data.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return data;
}

export async function updateTask(taskId: string, patch: Partial<StudyTask>) {
  const ref = doc(db, "tasks", taskId);
  await updateDoc(ref, patch);
}

export async function deleteTask(taskId: string) {
  await deleteDoc(doc(db, "tasks", taskId));
}

// =========================
// SESSIONS
// =========================
export async function addSession(session: Omit<StudySession, "id">) {
  const ref = await addDoc(collection(db, "sessions"), session);
  return ref.id;
}

export async function listSessions(uid: string, max = 500) {
  const q = query(collection(db, "sessions"), where("uid", "==", uid), limit(max));
  const snap = await getDocs(q);

  const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as StudySession) }));
  data.sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0));
  return data;
}

// =========================
// SUBJECTS
// =========================
export async function addSubject(subject: Omit<Subject, "id">) {
  const ref = await addDoc(collection(db, "subjects"), subject);
  return ref.id;
}

export async function listSubjects(uid: string) {
  const q = query(collection(db, "subjects"), where("uid", "==", uid), limit(300));
  const snap = await getDocs(q);

  const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Subject) }));
  data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  return data;
}

export async function deleteSubject(subjectId: string) {
  await deleteDoc(doc(db, "subjects", subjectId));
}

// =========================
// TOPICS
// =========================
export async function addTopic(topic: Omit<Topic, "id">) {
  const ref = await addDoc(collection(db, "topics"), topic);
  return ref.id;
}

export async function listTopics(uid: string, subjectId: string) {
  const q = query(
    collection(db, "topics"),
    where("uid", "==", uid),
    where("subjectId", "==", subjectId),
    limit(500)
  );

  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Topic) }));
  data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  return data;
}

export async function deleteTopic(topicId: string) {
  await deleteDoc(doc(db, "topics", topicId));
}

// =========================
// QUESTIONS
// =========================
export async function addQuestion(qData: Omit<Question, "id">) {
  const ref = await addDoc(collection(db, "questions"), qData);
  return ref.id;
}

export async function listQuestions(uid: string) {
  const q = query(collection(db, "questions"), where("uid", "==", uid), limit(1000));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Question) }));
}

export async function deleteQuestion(questionId: string) {
  await deleteDoc(doc(db, "questions", questionId));
}

// =========================
// ANSWERS
// =========================
export async function addAnswer(aData: Omit<UserAnswer, "id">) {
  const ref = await addDoc(collection(db, "answers"), aData);
  return ref.id;
}

export async function listAnswers(uid: string) {
  const q = query(collection(db, "answers"), where("uid", "==", uid), limit(2000));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as UserAnswer) }));
}

export async function deleteAnswer(answerId: string) {
  await deleteDoc(doc(db, "answers", answerId));
}

// =========================
// RESET (limpar estatÒ­stica)
// =========================
export async function deleteAllAnswersForUser(uid: string) {
  const q = query(collection(db, "answers"), where("uid", "==", uid), limit(5000));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

export async function deleteAllQuestionsForUser(uid: string) {
  const q = query(collection(db, "questions"), where("uid", "==", uid), limit(5000));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

