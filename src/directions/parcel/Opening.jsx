import { Header, Outro } from '../../components/Chrome.jsx';
import ParcelFilm from './ParcelFilm.jsx';

export default function ParcelOpening() {
  return <ParcelFilm before={<Header />} after={<Outro current="parcel" />} />;
}
