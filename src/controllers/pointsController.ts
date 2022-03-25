import { Request, Response } from 'express';
import knex from '../database/connection';

class pointsController {

  async index(request: Request, response: Response) {
    //cidade, uf, items (Query Parms)
    const { city, uf, items } = request.query;
    if (!city && !uf && !items) {
      const points = await knex('points')
        .join('point_item', 'points.id', '=', 'point_item.point_id')
        .distinct()
        .select('points.*');
      return response.json(points);
    }

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await knex('points')
      .join('point_item', 'points.id', '=', 'point_item.point_id')
      .whereIn('point_item.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    const serializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://192.168.2.119:3333/uploads/${point.image}`,
      };
    });

    return response.json(points);
  };

  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = request.body;

    const trx = await knex.transaction();

    const point = {
      Image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    };

    const insertedIds = await trx('points').insert(point);

    const point_id = insertedIds[0];

    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          item_id,
          point_id,
        };
      });

    await trx('point_item').insert(pointItems);

    await trx.commit();

    return response.json({
      id: point_id,
      ...point,
    });
  };

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      return response.status(400).json({ message: 'Point not found.' });
    }

    const serializedPoint = {
      ...point,
      image_url: `http://192.168.2.119:3333/uploads/${point.image}`,
    };

    const items = await knex('items')
      .join('point_item', 'items.id', '=', 'point_item.item_id')
      .where('point_item.point_id', id)
      .select('items.title');

    return response.json({ point: serializedPoint, items });
  }
};

export default pointsController;