import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ArabicHeadline } from '../components/ArabicTypography';
// PLACEHOLDER — to be produced after the opening is approved.
export const Closing = () => (
  <AbsoluteFill style={{ background: '#03060d', alignItems: 'center', justifyContent: 'center' }}>
    <ArabicHeadline text="الخاتمة — قيد الإنتاج" size={110} color="#6b5a40" />
  </AbsoluteFill>
);
