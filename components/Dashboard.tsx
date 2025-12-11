import React from 'react';
import { View } from '../types';
import { Sparkles, Clock, FileText, ArrowRight, CheckSquare, Users, ShieldAlert } from 'lucide-react';

interface DashboardProps {
  onChangeView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back, Teacher</h1>
        <p className="text-slate-500 dark:text-slate-400">Ready to inspire your students today?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => onChangeView(View.LESSON_PLANNER)}>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
            <FileText className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Create Lesson Plan</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Generate structured lesson plans aligned with curriculum standards instantly.</p>
          <span className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">Start planning <ArrowRight size={16} className="ml-1" /></span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => onChangeView(View.QUIZ_MAKER)}>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
            <Sparkles className="text-emerald-600 dark:text-emerald-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Generate Quiz</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Create engaging multiple-choice quizzes with explanations automatically.</p>
          <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">Create quiz <ArrowRight size={16} className="ml-1" /></span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => onChangeView(View.VISUAL_STUDIO)}>
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
            <Sparkles className="text-purple-600 dark:text-purple-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Visual Studio</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Generate unique, copyright-free images for your slides and handouts.</p>
          <span className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">Generate art <ArrowRight size={16} className="ml-1" /></span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => onChangeView(View.HOMEWORK_CHECKER)}>
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
            <CheckSquare className="text-orange-600 dark:text-orange-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Homework Checker</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">AI-powered grading assistant to review student submissions and provide feedback.</p>
          <span className="flex items-center text-orange-600 dark:text-orange-400 text-sm font-medium">Check work <ArrowRight size={16} className="ml-1" /></span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => onChangeView(View.ATTENDANCE)}>
          <div className="w-12 h-12 bg-pink-50 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-pink-100 dark:group-hover:bg-pink-900/50 transition-colors">
            <Users className="text-pink-600 dark:text-pink-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Attendance</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Quickly mark and track student attendance for your classes.</p>
          <span className="flex items-center text-pink-600 dark:text-pink-400 text-sm font-medium">Take attendance <ArrowRight size={16} className="ml-1" /></span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => onChangeView(View.PLAGIARISM_CHECKER)}>
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
            <ShieldAlert className="text-red-600 dark:text-red-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Plagiarism Checker</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Detect internet copying and compare student assignments for duplicates.</p>
          <span className="flex items-center text-red-600 dark:text-red-400 text-sm font-medium">Scan text <ArrowRight size={16} className="ml-1" /></span>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Updates</h2>
          <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300">View all</button>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-slate-500 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Added Plagiarism Checker</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">New tool to verify student work authenticity.</p>
            </div>
            <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">Just now</span>
          </div>
          <div className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-slate-500 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Added Homework Checker & Attendance</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">New tools to help manage your classroom efficiently.</p>
            </div>
            <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">1h ago</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;