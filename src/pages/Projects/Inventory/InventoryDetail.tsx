import { useParams } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';

export function InventoryDetail() {
  const { id } = useParams();

  // Replace with data from store/API
  const inventory = {
    id,
    unitNo: 'A-101',
    type: 'Flat',
    status: 'Available',
    carpetArea: '850 Sq.ft',
    builtUpArea: '1100 Sq.ft',
    saleableArea: '1250 Sq.ft',
    facing: 'East',
    floor: 1,
    price: 4500000,
  };


  return (
    <div className='space-y-6'>
      <Card>
        <h2 className='text-2xl font-bold'>{inventory.unitNo}</h2>

        <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <strong>Type:</strong> {inventory.type}
          </div>

          <div>
            <strong>Status:</strong> {inventory.status}
          </div>

          <div>
            <strong>Carpet Area:</strong> {inventory.carpetArea}
          </div>

          <div>
            <strong>Built-up Area:</strong> {inventory.builtUpArea}
          </div>

          <div>
            <strong>Saleable Area:</strong> {inventory.saleableArea}
          </div>

          <div>
            <strong>Facing:</strong> {inventory.facing}
          </div>

          <div>
            <strong>Floor:</strong> {inventory.floor}
          </div>

          <div>
            <strong>Price:</strong> ₹{inventory.price.toLocaleString('en-IN')}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default InventoryDetail;
