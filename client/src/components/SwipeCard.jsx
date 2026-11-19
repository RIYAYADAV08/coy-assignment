import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const THRESHOLD = 110; // px of horizontal drag that counts as a swipe
const FLY_MS = 280;

const clamp01 = (n) => Math.max(0, Math.min(1, n));

const SwipeCard = forwardRef(function SwipeCard({ profile, onSwiped, interactive = true }, ref) {
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [exit, setExit] = useState(null); // 'like' | 'pass' | null
  const start = useRef(null);
  const dragRef = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, t: 0, vx: 0 });
  const done = useRef(false);

  const fling = (dir) => {
    if (done.current) return;
    done.current = true;
    setExit(dir);
    window.setTimeout(() => onSwiped(dir, profile), FLY_MS);
  };

  // Lets the buttons / keyboard trigger the same animation as a drag.
  useImperativeHandle(ref, () => ({ swipe: fling }));

  const onPointerDown = (e) => {
    if (!interactive || done.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: e.clientX, t: performance.now(), vx: 0 };
    dragRef.current = { x: 0, y: 0 };
    setDrag({ x: 0, y: 0, active: true });
  };

  const onPointerMove = (e) => {
    if (!start.current) return;
    const x = e.clientX - start.current.x;
    const y = (e.clientY - start.current.y) * 0.4;
    const now = performance.now();
    const dt = now - velocity.current.t;
    if (dt > 0) velocity.current.vx = (e.clientX - velocity.current.x) / dt;
    velocity.current.x = e.clientX;
    velocity.current.t = now;
    dragRef.current = { x, y };
    setDrag({ x, y, active: true });
  };

  const onPointerUp = () => {
    if (!start.current) return;
    start.current = null;
    const { x } = dragRef.current;
    const { vx } = velocity.current;
    setDrag({ ...dragRef.current, active: false });
    if (x > THRESHOLD || (vx > 0.6 && x > 40)) fling('like');
    else if (x < -THRESHOLD || (vx < -0.6 && x < -40)) fling('pass');
    else setDrag({ x: 0, y: 0, active: false }); // spring back
  };

  const likeOpacity = exit === 'like' ? 1 : exit ? 0 : clamp01(drag.x / THRESHOLD);
  const passOpacity = exit === 'pass' ? 1 : exit ? 0 : clamp01(-drag.x / THRESHOLD);

  const transform = exit
    ? `translate(${exit === 'like' ? 130 : -130}%, ${drag.y}px) rotate(${exit === 'like' ? 18 : -18}deg)`
    : `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 18}deg)`;

  return (
    <article
      className={`card ${interactive ? 'is-top' : 'is-behind'}`}
      style={{
        transform,
        transition: drag.active
          ? 'scale .28s ease'
          : `transform ${FLY_MS}ms cubic-bezier(.2,.8,.2,1), scale .28s ease`
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label={`${profile.name}, ${profile.age}`}
    >
      <img className="card-photo" src={profile.photo} alt="" draggable={false} />
      <div className="card-shade" />

      <span className="stamp stamp-like" style={{ opacity: likeOpacity }}>Like</span>
      <span className="stamp stamp-pass" style={{ opacity: passOpacity }}>Pass</span>

      <div className="card-info">
        <h2>
          {profile.name} <span className="age">{profile.age}</span>
        </h2>
        <p className="place">{profile.place}</p>
        <p className="bio">{profile.bio}</p>
        <ul className="chips">
          {profile.interests.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
    </article>
  );
});

export default SwipeCard;
