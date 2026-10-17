import numpy as np
import pandas as pd
import tkinter as tk
from tkinter import messagebox, ttk
from sklearn.tree import DecisionTreeClassifier

def generate_synthetic_data():
    np.random.seed(42)
    num_samples = 1000
    
    # توليد علامات حيوية عشوائية ضمن النطاقات الطبية الفسيولوجية لجسم الإنسان
    age = np.random.randint(1, 90, size=num_samples)
    systolic_bp = np.random.randint(70, 190, size=num_samples)
    heart_rate = np.random.randint(40, 160, size=num_samples)
    resp_rate = np.random.randint(10, 35, size=num_samples)
    temperature = np.random.uniform(35.0, 41.0, size=num_samples)
    spo2 = np.random.randint(75, 100, size=num_samples)
    pain_level = np.random.randint(0, 11, size=num_samples)
    chronic_disease = np.random.randint(0, 2, size=num_samples)
    
    df = pd.DataFrame({
        'Age': age, 'Systolic_BP': systolic_bp, 'Heart_Rate': heart_rate,
        'Resp_Rate': resp_rate, 'Temperature': temperature, 'SpO2': spo2,
        'Pain_Level': pain_level, 'Chronic_Disease': chronic_disease
    })
    
    # تطبيق قواعد معايير فرز مانشستر الطبية لتحديد الفئات الثلاث (Target Classes)
    target = []
    for _, row in df.iterrows():
        if row['SpO2'] < 90 or row['Systolic_BP'] < 80:
            target.append(1)  # الفئة 1: حرجة فوراً (Immediate / Critical)
        elif row['Pain_Level'] > 7 or row['Temperature'] > 39.5 or row['Systolic_BP'] > 160:
            target.append(2)  # الفئة 2: عاجلة (Urgent)
        else:
            target.append(3)  # الفئة 3: مستقرة (Stable / Non-Urgent)
            
    df['Target'] = target
    return df

# تدريب نموذج شجرة القرار (Decision Tree Classifier)
data = generate_synthetic_data()
X = data.drop('Target', axis=1)
y = data['Target']

model = DecisionTreeClassifier(max_depth=5, random_state=42)
model.fit(X, y)

# 2. بناء واجهة المستخدم الرسومية البرمجية باستخدام Tkinter
class TriageApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Clinical Decision Support System - Intelligent Patient Triage")
        self.root.geometry("650x570")
        self.root.configure(bg="#f8f9f9")
        
        # شريط العنوان العلوي للبرنامج
        header = tk.Label(root, text="نظام دعم القرار السريري لفرز وترتيب أولويات المرضى ذكياً", 
                          font=("Arial", 14, "bold"), fg="white", bg="#2c3e50", pady=10)
        header.pack(fill=tk.X)
        
        # حاوية إدخال البيانات الحيوية للمريض
        input_frame = tk.LabelFrame(root, text=" إدخال المؤشرات الحيوية للمريض ", font=("Arial", 11, "bold"), bg="#ffffff", padx=10, pady=10)
        input_frame.pack(padx=20, pady=15, fill=tk.X)
        
        # حقول إدخال العلامات الفسيولوجية
        self.create_input_field(input_frame, "العمر (سنوات):", "age_entry", 0)
        self.create_input_field(input_frame, "ضغط الدم الانقباضي (mmHg):", "bp_entry", 1)
        self.create_input_field(input_frame, "معدل نبضات القلب (نبضة/دقيقة):", "hr_entry", 2)
        self.create_input_field(input_frame, "معدل التنفس (نفس/دقيقة):", "rr_entry", 3)
        self.create_input_field(input_frame, "درجة حرارة الجسم (مئوية):", "temp_entry", 4)
        self.create_input_field(input_frame, "نسبة أكسجين الدم (SpO2 %):", "spo2_entry", 5)
        self.create_input_field(input_frame, "مستوى الألم الحاد (0-10):", "pain_entry", 6)
        
        # خيار السوابق المرضية والأمراض المزمنة
        tk.Label(input_frame, text="هل يوجد تاريخ لأمراض مزمنة؟", font=("Arial", 10), bg="#ffffff").grid(row=7, column=0, sticky="w", pady=5)
        self.chronic_var = tk.StringVar(value="0")
        tk.Radiobutton(input_frame, text="لا يوجد", variable=self.chronic_var, value="0", bg="#ffffff").grid(row=7, column=1, sticky="w")
        tk.Radiobutton(input_frame, text="يوجد", variable=self.chronic_var, value="1", bg="#ffffff").grid(row=7, column=1, padx=80, sticky="w")
        
        # زر تشغيل الفرز الطبي والذكاء الاصطناعي
        btn_run = tk.Button(root, text="تشغيل الفرز الطبي الذكي", font=("Arial", 12, "bold"), fg="white", bg="#27ae60", 
                            command=self.execute_triage, cursor="hand2")
        btn_run.pack(pady=5)
        
        # شاشة عرض المخرجات وتفسير مبررات القرار الطبي الشجري
        self.result_frame = tk.LabelFrame(root, text=" مخرجات الفرز وتفسير القرار الطبي ", font=("Arial", 11, "bold"), bg="#ffffff", padx=10, pady=10)
        self.result_frame.pack(padx=20, pady=10, fill=tk.BOTH, expand=True)
        
        self.lbl_class = tk.Label(self.result_frame, text="في انتظار إدخال البيانات الحيوية وتنفيذ الفرز...", font=("Arial", 11), bg="#ffffff", fg="#7f8c8d")
        self.lbl_class.pack(pady=5, fill=tk.X)
        
        self.txt_reason = tk.Text(self.result_frame, height=4, font=("Arial", 10), bg="#fafafa", bd=1, relief="solid")
        self.txt_reason.pack(fill=tk.BOTH, expand=True, pady=5)

    def create_input_field(self, parent, label_text, attr_name, row_num):
        tk.Label(parent, text=label_text, font=("Arial", 10), bg="#ffffff").grid(row=row_num, column=0, sticky="w", pady=4)
        entry = tk.Entry(parent, font=("Arial", 10), bd=1, relief="solid", width=15)
        entry.grid(row=row_num, column=1, sticky="w", pady=4, padx=10)
        setattr(self, attr_name, entry)

    # 3. معالجة وتصنيف الحالة السريرية لحظياً عند الضغط على زر الفرز
    def execute_triage(self):
        try:
            # قراءة القياسات المدخلة وتحويلها برمجياً إلى مصفوفة رقمية موحدة
            patient_features = np.array([[
                float(self.age_entry.get()),
                float(self.bp_entry.get()),
                float(self.hr_entry.get()),
                float(self.rr_entry.get()),
                float(self.temp_entry.get()),
                float(self.spo2_entry.get()),
                float(self.pain_entry.get()),
                float(self.chronic_var.get())
            ]])
            
            # حساب التنبؤ وتعيين فئة الأولوية الطبية المحسوبة بواسطة شجرة القرار
            prediction = model.predict(patient_features)
            
            # تنظيف حقل النصوص وتحديث الواجهة الرسومية بالألوان والرموز المعتمدة بالبحث
            self.txt_reason.delete("1.0", tk.END)
            
            if prediction == 1:
                self.lbl_class.config(text="CLASS 1: IMMEDIATE / CRITICAL (حالة حرجة فوراً)", fg="#ffffff", bg="#c0392b")
                self.txt_reason.insert(tk.END, "⚠️ مبررات القرار الشجري المفسر:\n- تم رصد هبوط حاد جداً وخطير في المؤشرات الفسيولوجية الأساسية (نقص أكسجين الدم SpO2 أو هبوط وعائي حرج).\n- التوصية السريرية: يتطلب تدخلاً طبياً فورياً لإنقاذ حياة المريض في غضون ثوانٍ وبلا تأخير.")
            elif prediction == 2:
                self.lbl_class.config(text="CLASS 2: URGENT (حالة عاجلة)", fg="#2c3e50", bg="#f39c12")
                self.txt_reason.insert(tk.END, "🔔 مبررات القرار الشجري المفسر:\n- المريض يعاني من أعراض فسيولوجية حادة (ارتفاع شديد في الحرارة، ألم حاد، أو تسارع في العلامات الحيوية المريضة).\n- التوصية السريرية: يجب توجيه الحالة فوراً للفحص الطبي من قبل طبيب الطوارئ في غضون 15 إلى 30 دقيقة كحد أقصى.")
            else:
                self.lbl_class.config(text="CLASS 3: STABLE / NON-URGENT (حالة مستقرة)", fg="#ffffff", bg="#27ae60")
                self.txt_reason.insert(tk.END, "✅ مبررات القرار الشجري المفسر:\n- كافة العلامات الفسيولوجية والمؤشرات الحيوية للمريض تقع تماماً ضمن النطاقات الطبية الآمنة والمستقرة إحصائياً.\n- التوصية السريرية: إحالة المريض لمنطقة الانتظار العادية وتلقي الرعاية الدورية حسب الطاقة الاستيعابية للمستشفى.")
                
        except ValueError:
            messagebox.showerror("خطأ في البيانات", "يرجى التحقق من إدخال قيم عددية صحيحة في كافة حقول العلامات الحيوية.")

# تشغيل وتدشين النظام
if __name__ == "__main__":
    root = tk.Tk()
    app = TriageApp(root)
    root.mainloop()
