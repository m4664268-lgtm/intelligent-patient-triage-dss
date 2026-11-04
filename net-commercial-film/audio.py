import numpy as np, wave, sys
SR=48000; DUR=90.0; N=int(SR*DUR)
rng=np.random.default_rng(7)
L=np.zeros(N); R=np.zeros(N)
t_all=np.arange(N)/SR
def mtof(m): return 440*2**((m-69)/12)
def add(sig,start,pan=0.0,gain=1.0):
    i=int(start*SR); n=min(len(sig),N-i)
    if n<=0: return
    gl=np.cos((pan+1)*np.pi/4)*gain; gr=np.sin((pan+1)*np.pi/4)*gain
    L[i:i+n]+=sig[:n]*gl; R[i:i+n]+=sig[:n]*gr
def band(x,lo,hi):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR)
    m=np.clip((f-lo)/(lo*.5+1),0,1)*np.clip((hi-f)/(hi*.5+1),0,1)
    return np.fft.irfft(X*m,len(x))
def env_adsr(n,a,r):
    e=np.ones(n); na=int(a*SR); nr=int(r*SR)
    e[:na]=np.linspace(0,1,na)**2
    if nr>0: e[-nr:]*=np.linspace(1,0,nr)**1.5
    return e

# ---- harmonic plan: (start,end,[midi notes]) ----
plan=[(0,8,[38,45,50,52,57]),        # Dm add9
      (8,18,[34,46,50,53,57]),       # Bbmaj7
      (18,28,[41,48,53,57,60]),      # F
      (28,38,[36,48,52,55,60]),      # C
      (38,48,[38,50,53,57,62]),      # Dm
      (48,58,[34,46,50,53,58]),      # Bb
      (58,68,[36,48,52,55,62]),      # C add9
      (68,71,[41,53,57,60,65]),      # F
      (71,74,[43,55,58,62,65]),      # Gm
      (74,77,[34,50,53,58,62]),      # Bb
      (77,80,[36,48,53,55,60]),      # Csus
      (80,90,[41,48,53,57,60,64])]   # Fmaj7 resolve

# ---- pad (warm additive strings) ----
for (a,b,notes) in plan:
    s=max(0,a-1.2); e=min(DUR,b+1.2); n=int((e-s)*SR); tt=np.arange(n)/SR
    sig=np.zeros(n)
    for k,m in enumerate(notes):
        f0=mtof(m)
        for det in (-0.12,0.0,0.13):
            f=f0*2**(det/12/8)
            for h in range(1,7):
                sig+=np.sin(2*np.pi*f*h*tt+rng.random()*6.28)*(1/h**1.7)*(0.9 if k==0 else 0.55)
    vib=1+0.12*np.sin(2*np.pi*0.18*tt+a)
    sig*=vib*env_adsr(n,1.6,1.6)
    lvl=0.010 if a<18 else 0.012
    if a>=68: lvl=0.016
    if a==80: lvl=0.014; sig*=np.clip((DUR-(s+tt))/3,0,1)
    add(sig,s,-0.25,lvl); add(np.roll(sig,331),s,0.25,lvl)

# ---- sub drone ----
dr=np.sin(2*np.pi*mtof(26)*t_all)*0.5+np.sin(2*np.pi*mtof(38)*t_all)*0.25
dr*=np.clip(t_all/3,0,1)*np.clip((DUR-t_all)/4,0,1)*(0.7+0.3*np.sin(2*np.pi*0.07*t_all))
L+=dr*0.05; R+=dr*0.05

# ---- piano-like arpeggio 18..80 ----
beat=60/84; eighth=beat/2
def pluck(f,dur=1.6,vel=1.0):
    n=int(dur*SR); tt=np.arange(n)/SR
    s=(np.sin(2*np.pi*f*tt)+0.45*np.sin(2*np.pi*2*f*tt)*np.exp(-tt*5)+0.2*np.sin(2*np.pi*3.01*f*tt)*np.exp(-tt*8))
    s*=np.exp(-tt*2.6)*np.minimum(1,tt*400)
    return s*vel
t=18.0;i=0
while t<80:
    notes=[p for p in plan if p[0]<=t<p[1]][0][2]
    seq=[notes[1]+12,notes[2]+12,notes[3]+12,notes[4]+12,notes[3]+12,notes[2]+12]
    m=seq[i%len(seq)]
    vel=0.6+0.4*((i%4)==0)
    lvl=0.018 if t<48 else 0.022
    add(pluck(mtof(m),vel=vel),t,0.35*np.sin(i*0.9),lvl)
    t+=eighth if t>=48 else beat; i+=1

# ---- rhythm 48..80 (soft thumps + ticks) ----
def thump(dur=.7):
    n=int(dur*SR); tt=np.arange(n)/SR
    f=48+70*np.exp(-tt*28); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-tt*7)
th=thump(); tick=band(rng.standard_normal(int(.06*SR)),5000,12000)*np.exp(-np.arange(int(.06*SR))/SR*90)
t=48.0;i=0
while t<80:
    g=0.10 if t<68 else 0.14
    add(th,t,0,g)
    if i%2==1: add(th*0.6,t+beat*0.75,0,g*0.5)
    add(tick,t+beat/2,0.4,0.05); add(tick,t+beat*0.25,-0.4,0.025)
    t+=beat;i+=1

# ---- impacts ----
def impact(dur=4.0,f0=55,noise=0.35):
    n=int(dur*SR); tt=np.arange(n)/SR
    f=f0+90*np.exp(-tt*16); ph=2*np.pi*np.cumsum(f)/SR
    s=np.sin(ph)*np.exp(-tt*1.4)
    nz=band(rng.standard_normal(n),40,900)*np.exp(-tt*5)*noise
    return (s+nz)*np.minimum(1,tt*300)
add(impact(6,45,.5),0.15,0,0.55)
for b in [8,18,28,38,48,58,68,80]:
    add(impact(2.5,60,.25),b+0.02,0,0.16 if b not in (68,80) else 0.3)

# ---- whooshes on each transition (pan right->left like the light streak) ----
def whoosh(dur=1.6):
    n=int(dur*SR); tt=np.arange(n)/SR
    nz=rng.standard_normal(n)
    lo=band(nz,200,1500); hi=band(nz,1500,7000)
    x=tt/dur; mix=np.clip(x*1.4,0,1)
    e=np.sin(np.pi*np.clip(x,0,1))**3
    return (lo*(1-mix)+hi*mix*0.7)*e
for b in [8,18,28,38,48,58,68,80]:
    w=whoosh(); n=len(w); i0=int((b-0.85)*SR)
    pan=np.linspace(0.9,-0.9,n)
    gl=np.cos((pan+1)*np.pi/4); gr=np.sin((pan+1)*np.pi/4)
    L[i0:i0+n]+=w*gl*0.12; R[i0:i0+n]+=w*gr*0.12

# ---- riser into climax (77-80) ----
n=int(3*SR); tt=np.arange(n)/SR
rz=band(rng.standard_normal(n),800,9000)*(tt/3)**2.5
add(rz,77.0,0,0.06)

# ---- metallic logo reveal (82.6) + final impact ----
def bell(f0,dur=6):
    n=int(dur*SR); tt=np.arange(n)/SR; s=np.zeros(n)
    for r,a,d in [(1,1,1.2),(2.76,.5,2.2),(5.4,.3,3.5),(8.93,.18,5),(13.3,.1,7)]:
        s+=np.sin(2*np.pi*f0*r*tt)*a*np.exp(-tt*d)
    return s*np.minimum(1,tt*600)
add(bell(mtof(77)),82.6,-0.3,0.05); add(bell(mtof(84)),82.68,0.3,0.035)
sh=band(rng.standard_normal(int(2.5*SR)),6000,14000); sh*=np.exp(-np.arange(len(sh))/SR*2)*np.minimum(1,np.arange(len(sh))/SR*8)
add(sh,82.4,0,0.05)
add(impact(5,41,.4),82.6,0,0.35)
add(impact(5,41,.3),86.2,0,0.22)

# ---- master ----
def master(x):
    x=np.tanh(x*1.6)/1.6
    return x
L=master(L);R=master(R)
fade=np.clip((DUR-t_all)/2.0,0,1)
L*=fade;R*=fade
peak=max(np.abs(L).max(),np.abs(R).max()); g=0.89/peak
L*=g;R*=g
out=np.stack([L,R],1)
pcm=(out*32767).astype(np.int16)
with wave.open(sys.argv[1],'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
print('ok peak',peak)
