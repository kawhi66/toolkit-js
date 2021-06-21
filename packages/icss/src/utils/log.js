import randomColor from './randomColor';

export default function log(msg, pkg) {
  const pkgName = (typeof pkg === 'string' ? pkg : pkg?.name) || 'unknown';
  console.log(`${pkg ? `${randomColor(`${pkgName}`)}: ` : ''}${msg}`);
}
